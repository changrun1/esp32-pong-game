

#include <Arduino.h>

#ifndef PIEZO_PIN
#define PIEZO_PIN  (22)
#endif



#define _C0    (16.35)
#define _CS0   (17.32)
#define _D0    (18.35)
#define _DS0   (19.45)
#define _E0    (20.60)
#define _F0    (21.83)
#define _FS0   (23.12)
#define _G0    (24.50)
#define _GS0   (25.96)
#define _A0    (27.50)
#define _AS0   (29.14)
#define _B0    (30.87)
#define _C1    (32.70)
#define _CS1   (34.65)
#define _D1    (36.71)
#define _DS1   (38.89)
#define _E1    (41.20)
#define _F1    (43.65)
#define _FS1   (46.25)
#define _G1    (49.00)
#define _GS1   (51.91)
#define _A1    (55.00)
#define _AS1   (58.27)
#define _B1    (61.74)
#define _C2    (65.41)
#define _CS2   (69.30)
#define _D2    (73.42)
#define _DS2   (77.78)
#define _E2    (82.41)
#define _F2    (87.31)
#define _FS2   (92.50)
#define _G2    (98.00)
#define _GS2   (103.83)
#define _A2    (110.00)
#define _AS2   (116.54)
#define _B2    (123.47)
#define _C3    (130.81)
#define _CS3   (138.59)
#define _D3    (146.83)
#define _DS3   (155.56)
#define _E3    (164.81)
#define _F3    (174.61)
#define _FS3   (185.00)
#define _G3    (196.00)
#define _GS3   (207.65)
#define _A3    (220.00)
#define _AS3   (233.08)
#define _B3    (246.94)
#define _C4    (261.63)
#define _CS4   (277.18)
#define _D4    (293.66)
#define _DS4   (311.13)
#define _E4    (329.63)
#define _F4    (349.23)
#define _FS4   (369.99)
#define _G4    (392.00)
#define _GS4   (415.30)
#define _A4    (440.00)
#define _AS4   (466.16)
#define _B4    (493.88)
#define _C5    (523.25)
#define _CS5   (554.37)
#define _D5    (587.33)
#define _DS5   (622.25)
#define _E5    (659.25)
#define _F5    (698.46)
#define _FS5   (739.99)
#define _G5    (783.99)
#define _GS5   (830.61)
#define _A5    (880.00)
#define _AS5   (932.33)
#define _B5    (987.77)
#define _C6    (1046.50)
#define _CS6   (1108.73)
#define _D6    (1174.66)
#define _DS6   (1244.51)
#define _E6    (1318.51)
#define _F6    (1396.91)
#define _FS6   (1479.98)
#define _G6    (1567.98)
#define _GS6   (1661.22)
#define _A6    (1760.00)
#define _AS6   (1864.66)
#define _B6    (1975.53)
#define _C7    (2093.00)
#define _CS7   (2217.46)
#define _D7    (2349.32)
#define _DS7   (2489.02)
#define _E7    (2637.02)
#define _F7    (2793.83)
#define _FS7   (2959.96)
#define _G7    (3135.96)
#define _GS7   (3322.44)
#define _A7    (3520.00)
#define _AS7   (3729.31)
#define _B7    (3951.07)
#define _C8    (4186.01)
#define _CS8   (4434.92)
#define _D8    (4698.63)
#define _DS8   (4978.03)
#define _E8    (5274.04)
#define _F8    (5587.65)
#define _FS8   (5919.91)
#define _G8    (6271.93)
#define _GS8   (6644.88)
#define _A8    (7040.00)
#define _AS8   (7458.62)
#define _B8    (7902.13)
#define _R     (0)

#define BPM   (120.0)


static const float lead_notes[] PROGMEM = {
  
  _E5, _B4, _C5, _D5, _C5, _B4, _A4, _A4, _C5, _E5, _D5, _C5, _B4, _B4, _C5, _D5, _E5, _C5, _A4, _A4, _R,
  _D5, _F5, _A5, _G5, _F5, _E5, _C5, _E5, _D5, _C5, _B4, _B4, _C5, _D5, _E5, _C5, _A4, _A4, _R,


};

static const float lead_times[] PROGMEM = {
  
  1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
  1.5, 0.5, 1.0, 0.5, 0.5, 1.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,

};

static const float bass_notes[] PROGMEM = {
  
  _E2, _E3, _E2, _E3, _E2, _E3, _E2, _E3, _A1, _A2, _A1, _A2, _A1, _A2, _A1, _A2, _GS1, _GS2, _GS1, _GS2, _GS1, _GS2, _GS1, _GS2, _A1, _A2, _A1, _A2, _A1, _B2, _C3, _E3,
  _D2, _D3, _D2, _D3, _D2, _D3, _D2, _D3, _C2, _C3, _C2, _C3, _C2, _C3, _C2, _C3, _B1, _B2, _B1, _B2, _B1, _B2, _B1, _B2, _A1, _A2, _A1, _A2, _A1, _A2, _A1, _A2,

};

static const int lead_note_count = sizeof(lead_notes) / sizeof(float);
static const int bass_note_count = sizeof(bass_notes) / sizeof(float);

static volatile boolean songOn;

 
class TetrisTheme {
   
  public:
  
    static void init() {
      pinMode(22, OUTPUT);
      songOn = false;
    }
  
    static void start() {
      init();
      songOn = true;
    }

    static void stop() {
      noTone(22);
      songOn = false;
    }

    
    static void tetrisThemePlay() {
      static unsigned long lastTime = 0;
      static int noteIndex = 0;
      static float noteDuration = 0;
      static boolean notePlaying = false;
      if (!songOn) {
        return;
      }
        
      
      
      if (millis() - lastTime >= noteDuration) {
        if (notePlaying) {
          noTone(22);
          notePlaying = false;
        }
        if (noteIndex < lead_note_count) {
          float note = pgm_read_float_near(lead_notes + noteIndex);
          float duration = pgm_read_float_near(lead_times + noteIndex) * 60000.0 / BPM;
          tone(22, note);
          noteDuration = duration;
          notePlaying = true;
          noteIndex++;
        }
        else if (noteIndex < lead_note_count + bass_note_count) {
          float note = pgm_read_float_near(bass_notes + noteIndex - lead_note_count);
          float duration = 150.0;
          tone(22, note);
          noteDuration = duration;
          notePlaying = true;
          noteIndex++;
        }
        else {
          noteIndex = 0;
        }
        lastTime = millis();
      

      }
    }
   
   
};
 

