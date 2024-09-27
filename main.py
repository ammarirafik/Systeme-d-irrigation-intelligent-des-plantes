import pyrebase
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.impute import SimpleImputer
import threading
import time

from flask import Flask

# Configuration Firebase
firebaseConfig = {
    "apiKey": "AIzaSyBiyof114SEvTcsGJdVV3tKrzqAO-EwmR0",
    "authDomain": "plante-9ebda.firebaseapp.com",
    "databaseURL": "https://plante-9ebda-default-rtdb.firebaseio.com",
    "projectId": "plante-9ebda",
    "storageBucket": "plante-9ebda.appspot.com",
    "messagingSenderId": "1079762827569",
    "appId": "1:1079762827569:web:aa53c8713d706e52cf5810",
    "measurementId": "G-5KN15EML5B"
}

# Initialisation de l'application Firebase
firebase = pyrebase.initialize_app(firebaseConfig)
db = firebase.database()

# Charger les données depuis un fichier CSV (ou tout autre format de fichier)
data = pd.read_csv("C:\\Users\\msi\\Desktop\\back\\data1.csv", delimiter=';', encoding='latin1')

# Supprimer l'espace supplémentaire à la fin du nom de la colonne
data.columns = data.columns.str.strip()

# Prétraitement des données
# Sélectionner les colonnes pertinentes
X = data[['plante', 'humidite du sol', 'temperature', 'luminosite']]  # Ajouter la colonne 'plante'

# Supprimer les lignes avec des valeurs manquantes dans X
X_imputed = SimpleImputer(strategy='mean').fit_transform(X.iloc[:, 1:])
X.iloc[:, 1:] = pd.DataFrame(X_imputed, columns=X.columns[1:]).astype(int)

# Accéder à la colonne "etat d'arrosage" sans espace supplémentaire
y = data['etat d\'arrosage']

# Initialisation du modèle de Random Forest Classifier
model = RandomForestClassifier()

# Définition des hyperparamètres à rechercher
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Initialisation de la recherche d'hyperparamètres avec validation croisée stratifiée
grid_search = GridSearchCV(estimator=model, param_grid=param_grid, cv=StratifiedKFold(n_splits=5), scoring='accuracy')

# Exécution de la recherche d'hyperparamètres sur les données d'entraînement
grid_search.fit(X.iloc[:, 1:], y)

# Affichage des meilleurs paramètres trouvés
print("Meilleurs paramètres :", grid_search.best_params_)

# Affichage de la performance moyenne du modèle avec les meilleurs paramètres
print("Performance moyenne du modèle avec les meilleurs paramètres :", grid_search.best_score_)

# Entraînement du modèle sur l'ensemble des données avec les meilleurs paramètres trouvés
best_model = RandomForestClassifier(**grid_search.best_params_)
best_model.fit(X.iloc[:, 1:], y)


# Fonction pour entraîner le modèle à intervalles réguliers
def train_model_periodically():
    while True:
        # Récupération des données depuis Firebase
        firebase_data = db.get().val()

        # Création d'un DataFrame à partir des données récupérées
        nouvelles_donnees_df = pd.DataFrame.from_dict(firebase_data, orient='index').T

        # Réordonner les colonnes dans le DataFrame nouvellement créé pour correspondre à l'ordre utilisé pour entraîner le modèle
        nouvelles_donnees_df = nouvelles_donnees_df[['plante', 'humidite du sol', 'temperature', 'luminosite']]

        # Sélectionner toutes les colonnes sauf la colonne 'plante'
        X_impute = nouvelles_donnees_df.drop(columns=['plante'])

        # Prétraiter les nouvelles données en utilisant la stratégie 'mean' pour les colonnes numériques
        nouvelles_donnees_imputed = SimpleImputer(strategy='mean').fit_transform(X_impute)

        # Remplacer les valeurs imputées dans le DataFrame
        nouvelles_donnees_df.iloc[:, 1:] = nouvelles_donnees_imputed

        # Faire des prédictions sur les nouvelles données prétraitées avec le meilleur modèle
        predictions_nouvelles_donnees = best_model.predict(nouvelles_donnees_df.iloc[:, 1:])

        # Envoi des prédictions à Firebase
        predictions = []

        for i, prediction in enumerate(predictions_nouvelles_donnees):
            prediction_text = 'Arrosée' if prediction == 1 else 'Non arrosée'
            predictions.append({"Plante": nouvelles_donnees_df.iloc[i, 0], "Prediction": prediction_text})

        db.child("predictions").set(predictions)

        print("Prédictions envoyées à Firebase avec succès!")

        # Attendre 6 secondes avant de ré-entraîner le modèle
        time.sleep(6)  # 6 secondes


# Démarrer la fonction d'entraînement du modèle dans un thread
thread = threading.Thread(target=train_model_periodically)
thread.start()


app = Flask(__name__)


@app.route('/prediction', methods=['GET'])
def get_prediction():
    # Récupérer les données depuis Firebase
    firebase_data = db.get().val()

    # Créer un DataFrame à partir des données récupérées
    nouvelles_donnees_df = pd.DataFrame.from_dict(firebase_data, orient='index').T

    # Réordonner les colonnes dans le DataFrame nouvellement créé pour correspondre à l'ordre utilisé pour entraîner le modèle
    nouvelles_donnees_df = nouvelles_donnees_df[['plante', 'humidite du sol', 'temperature', 'luminosite']]

    # Sélectionner toutes les colonnes sauf la colonne 'plante'
    X_impute = nouvelles_donnees_df.drop(columns=['plante'])

    # Prétraiter les nouvelles données en utilisant la stratégie 'mean' pour les colonnes numériques
    nouvelles_donnees_imputed = SimpleImputer(strategy='mean').fit_transform(X_impute)

    # Remplacer les valeurs imputées dans le DataFrame
    nouvelles_donnees_df.iloc[:, 1:] = nouvelles_donnees_imputed

    # Faire des prédictions sur les nouvelles données prétraitées avec le meilleur modèle
    predictions_nouvelles_donnees = best_model.predict(nouvelles_donnees_df.iloc[:, 1:])

    # Créer une liste de prédictions à envoyer à Firebase
    predictions = []

    for i, prediction in enumerate(predictions_nouvelles_donnees):
        prediction_text = 'Arrosée' if prediction == 1 else 'Non arrosée'
        predictions.append({"Plante": nouvelles_donnees_df.iloc[i, 0], "Prediction": prediction_text})

    # Envoi des prédictions à Firebase
    db.child("predictions").set(predictions)

    return {"prediction": predictions}


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
