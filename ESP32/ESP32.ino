#include <WiFi.h> 
#include <WebServer.h>
#include <ArduinoWebsockets.h>
#include <MD_MAX72xx.h>
#include "TetrisTheme.cpp"


using namespace websockets;

WebServer server(80);

WebsocketsClient client;



#define APSSID "SetUpESP"
#define APPSK "password"

#define WebSocketServerIP "ws://123.194.35.219:8000"

const char *ssid = APSSID;
const char *password = APPSK;


/*-------------------------------------*/
// 按照這個接角接
// 按鈕按下去高電位，記得接地
// led矩陣Vcc連5V
#define WiFiPin  2 // led燈
#define DIN  18 // led矩陣
#define CS  19 // led矩陣
#define CLK  21 // led矩陣
#define rightButtonPin  27 // 按鈕
#define leftButtonPin  26 // 按鈕
#define singleplayerPin  35 // 按鈕
#define multiplayerPin 32 // 按鈕
#define musedashPin 33 // 按鈕
#define exitPin 25 // 按鈕
#define BZpin 22 // 蜂鳴器
/*------------------------------------*/

MD_MAX72XX mx = MD_MAX72XX(MD_MAX72XX::PAROLA_HW, DIN, CLK, CS,8);


void handleRoot() {
  String html = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><form method=\"get\" action=\"connect\"><label>SSID: </label><input name=\"ssid\"><br><label>Password: </label><input name=\"password\"><br><button type=\"submit\">連接</button></form>";
  server.send(200, "text/html", html);
}


void handleConnect() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");
  Serial.println("正在連接至 " + ssid + "...");
  WiFi.begin(ssid.c_str(), password.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("SSID: " + ssid);
    Serial.println("Password: " + password);
    Serial.println("連接中...");
  }
  Serial.println("已連接至 " + ssid);
  server.send(200, "text/html", "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><h1>已連接至 " + ssid + "</h1>");
  connectToWebSocket();

}


bool resetGmae = false;
bool gameStarted = false;
int state = 0;

void connectToWebSocket() {
  bool connected = client.connect(WebSocketServerIP);
  delay(100);
  while(!connected){
    Serial.println("連接伺服器失敗，五秒鐘後將再試一次");
    delay(5000);
    connected = client.connect(WebSocketServerIP);
  }
  Serial.println("連接到伺服器了");
  

  client.onMessage([&](WebsocketsMessage message) {
      String data = message.data().c_str();
      if(data.startsWith("Game over")){
        resetGmae = true;
      }
      if(data.startsWith("Game has started")){
        gameStarted = true;
      }
      if (data.startsWith("GameInfo ")) {
          data.remove(0, 9);
          int spaceIndex = data.indexOf(" ");
          String ballXStr = data.substring(0, spaceIndex);
          data.remove(0, spaceIndex + 1);
          spaceIndex = data.indexOf(" ");
          String ballYStr = data.substring(0, spaceIndex);
          data.remove(0, spaceIndex + 1);
          spaceIndex = data.indexOf(" ");
          String board1Str = data.substring(0, spaceIndex);
          data.remove(0, spaceIndex + 1);
          String board2Str = data;
          int ballX = ballXStr.toInt();
          int ballY = ballYStr.toInt();
          int board1 = board1Str.toInt();
          int board2 = board2Str.toInt();
          drawScreen(ballX, ballY, board1, board2);
      }
  });
  
}


void drawScreen(int ballX, int ballY, int board1, int board2){
  if(state == 2){
    return;
  }
  mx.clear();
  
  for(int i = -3;i <= 2; i++){
    int x = board1 / 100 + i;
    int y = 6;
    if(x < 8){
      
      y += 32;
    }else{
      x -= 8;
    }
    mx.setPoint(x, y, 1);
    x = board2 / 100 + i;
    y = 25;
    if(x < 8){
      
      y += 32;
    }else{
      x -= 8;
    }  
    mx.setPoint(x, y, 1);
  }

  int x = ballX / 100;
  int y = ballY / 100;
    if(x < 8){
      
      y += 32;
    }else{
      x -= 8;
    }
  y = ((y / 8) * 8) + 7 - y % 8;
  mx.setPoint(x, y, 1);

}

void setup() {
  

  mx.begin();
  mx.clear();


  delay(1000);
  Serial.begin(9600);
  Serial.println();
  Serial.print("正在配置接入點...");

  WiFi.softAP(ssid, password);

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("接入點 IP 地址: ");
  Serial.println(myIP);
  server.on("/", handleRoot);
  server.on("/connect", handleConnect);
  server.begin();
  Serial.println("HTTP 伺服器已啟動");

  pinMode(WiFiPin, OUTPUT);
  pinMode(rightButtonPin, INPUT);
  pinMode(leftButtonPin, INPUT);
  pinMode(singleplayerPin, INPUT);
  pinMode(multiplayerPin, INPUT);
  pinMode(musedashPin, INPUT);
  pinMode(exitPin, INPUT);
  //pinMode(BZpin, OUTPUT);

  //TetrisTheme::start();
}



void loop() {
  
  
  if(digitalRead(rightButtonPin)){
    Serial.println("Right button pressed");
  }
  if(digitalRead(leftButtonPin)){
    Serial.println("Left button pressed");
  }
  if(digitalRead(singleplayerPin)){
    Serial.println("Singleplayer button pressed");
  }
  if(digitalRead(multiplayerPin)){
    Serial.println("Multiplayer button pressed");
  }
  if(digitalRead(musedashPin)){
    Serial.println("Musedash button pressed");
  }
  if(digitalRead(exitPin)){
    Serial.println("Exit button pressed");
  }

  
  
  //TetrisTheme::tetrisThemePlay();
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(WiFiPin,1);
    server.handleClient();
    digitalWrite(WiFiPin, LOW);
  }else{
    digitalWrite(WiFiPin,0);
    if(client.available()) {
        client.poll();
    }
    // 0是還沒選模式

    switch(state){
      case 0:
        mx.clear();
        if(digitalRead(singleplayerPin)){
          Serial.print("S");
          client.send("singleplayer");
          gameStarted = false;
          state = 1;
        }
        if(digitalRead(multiplayerPin)){
          client.send("multiplayer");
          gameStarted = false;
          state = 1;
        }
        break;
      case 1:
        mx.clear();
        if(gameStarted){
          state = 2;
          resetGmae = false;
        }
        break;
      case 2:
        if (digitalRead(rightButtonPin)) {

          client.send("right");
        }
        if (digitalRead(leftButtonPin)) {
          client.send("left");
        
        }
        if (digitalRead(exitPin)) {
          client.send("exit");
          resetGmae = true;
        }
        if(resetGmae){
          gameStarted = false;
          state = 0;
          connectToWebSocket();
        }
        break;
    }
  }
}

