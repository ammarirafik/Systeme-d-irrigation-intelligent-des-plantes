#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Servo.h>
#include <FirebaseESP8266.h>
#include <DHT.h>

const char* ssid = "ooredoo_C22830";
const char* password = "33NCCRHPE93RE";
#define FIREBASE_HOST "plante-9ebda-default-rtdb.firebaseio.com/" // Adresse de votre projet Firebase
#define FIREBASE_AUTH "MtqnzxiOrLCwgq7lyjDRZC2LOAC6gPYiLBWojbzW" // Clé d'authentification de votre projet Firebase
#define WIFI_SSID "ooredoo_C22830"
#define WIFI_PASSWORD "33NCCRHPE93RE"
#define DHT_PIN D3
#define LDR_PIN A0

Servo servo;
bool servoEnMarche = false;
int servoPosition = 0;

ESP8266WebServer server(80);
FirebaseData firebaseData;
DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(115200);

  servo.attach(D1); // Connectez le signal du servo à la broche D1 de l'ESP8266
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion au WiFi en cours...");
  }
  Serial.println("Connecté au réseau WiFi !");
  Serial.print("Adresse IP: ");
  Serial.println(WiFi.localIP());

  server.on("/startServo", HTTP_GET, [](){
    startServo();
    server.send(200, "text/plain", "Servomoteur démarré");
  });

  server.on("/stopServo", HTTP_GET, [](){
    stopServo();
    server.send(200, "text/plain", "Servomoteur arrêté");
  });

  server.begin();
  Serial.println("Serveur démarré !");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void loop() {
  server.handleClient();
  if (servoEnMarche) {
    servo.write(servoPosition);
    delay(15); 
    servoPosition += 50; 
    if (servoPosition > 180) {
      servoPosition = 0; 
    }
  }

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightIntensity = analogRead(LDR_PIN);

  Firebase.setFloat(firebaseData, "temperature", temperature);
  Firebase.setFloat(firebaseData, "humidite du sol", humidity);
  Firebase.setInt(firebaseData, "luminosite", lightIntensity);

  delay(1000);
}

void startServo() {
  servoEnMarche = true;
  servoPosition = 0; 
}

void stopServo() {
  servoEnMarche = false;
}
