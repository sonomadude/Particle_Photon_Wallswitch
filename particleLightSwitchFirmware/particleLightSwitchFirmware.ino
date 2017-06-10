// This code is simple - it is just for prototype testing. Evenutally
// this code will include the ability to have scheduled on/off times,
// account for DST, will be able to use sunrise/sunset knowledge so
// lights can control themselves

int capDisplay = D2;    // Drives LED of cap touch switch/display
int relayDrive = D4;    // Drives relay controlling 120VAC
int capSense = D6;      // Senses touch on cap touch button

int lightState = 0;     // State variable for relay status

void setup()
{
// Setup pins
    pinMode(relayDrive, OUTPUT);
    pinMode(capDisplay, OUTPUT);
    pinMode(capSense, INPUT);
    digitalWrite(relayDrive, LOW);    // Set initial state of relay open
    digitalWrite(capDisplay, HIGH);   // Set initial state of LED off

// Set Particle variable and function
    Particle.variable("lightState", lightState);   // variable: 0 = Off, 1 = On
    Particle.function("switchLight", switchLight); // Sets relayState
}


void loop()
{
// Test cap touch sensor for physical finger touch
  if (digitalRead(capSense) == 1 && lightState == 0) {      // If relay off & touch sensed
    delay(25);                                              // Is it really touched? Wait ...
    if (digitalRead(capSense) == 1) lightState = 1;         // .... turn it on
    setOutputs();                                           // Switch relay
    delay(1000);                                            // Insure no double touch
  }
  else if (digitalRead(capSense) == 1 && lightState == 1) { // else if relay is on ...
    delay(25);                                              // Is it really touched? Wait ...
    if (digitalRead(capSense) == 1) lightState = 0;         // ... turn it off
    setOutputs();                                           // Set LED and relay output pins
    delay(1000);                                            // Insure no double touch
  }
}


// Function to switch relay, turn on/off LED in display
void setOutputs()
{
    if (lightState == 0)                    // Need to set relay open
    {
        digitalWrite(relayDrive, LOW);      // Switch relay off
        digitalWrite(capDisplay, HIGH);     // Turn off PCB LED
    }
    else if (lightState == 1)               // Need to pull in relay
    {
        digitalWrite(relayDrive, HIGH);     // Switch relay on
        digitalWrite(capDisplay, LOW);      // Turn on PCB LED
    }
}


// PARTICLE FUNCTION switchRelay
int switchLight(String x)               // String x will be a 0 for relay off; a 1 for relay on)
{
    int tempValue = x.charAt(0) - '0';  // Extract integer
    if (tempValue == 0)
    {
        lightState = 0;                  // Set for relay off
    }
    else if (tempValue == 1)
    {
       lightState = 1;                   // Set for relay on
    }
    setOutputs();                        // Set LED and relay output pins
    return lightState;
}
