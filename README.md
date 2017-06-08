# Particle_Photon_Wallswitch
This repository will hold all assets for my entry into the Hackaday prize 2017 - a Particle Photon WallSwitch.

The goal of this project is to create a wall switch assembly that can fit into a deep US junction box, and, since it is using mains power directly, to do this safely (I will be installing a number of these in my barn, and eventually home if all goes well, so it has to be safe). And the switch must be both locally and remotely controllable.

On the safety end, great care is being taken in PCB layout to insure safe and reliable operation. The Saturn PCB Design Toolkit and PCB layout DRC (Design Rule Checking) was used to make sure trace separations met requirements for safety.  Board slots were also cut underneath the flyback transformer and the relay, separating the mains or 170VDC PCB areas from the nearby 5VDC areas. The assembly includes a fused resistor at power entry (that hopefully never blows because it cannot be reset) in case of a catastrophic failure of the 120VAC to 5VDC circuitry. All ingress wires are clamped to the PCB board for strain relief. If there is time, a probably oversimplified and probably crude EMC pre-compliance test will be done in my lab. 

There will be 5 ways to control the switch.  The first, physically making it switch, is done via a capacitive touch button. That button can be off or illuminated dimly when the switch is off, and then illuminated brightly when the switch is on (brightness controlled via PWM). To control the light remotely, an Android app, an iPhone app, an Alexa skill, and a web page will be created.

The firmware in the Particle Photon will initially just be able to turn on and off the switch. In final form, that firmware will be able to programmatically turn the switch on and off, either through specified times, or based on sunset or sunrise. The firmware will include the ability to identify time zone, DST, and sunrise/sunset using the Particle Cloud’s Webhooks capability.

The remote app software will also initially just be for turn on and turn off. But the finished apps will be able to set the time-based scheduling methods mentioned in the firmware paragraph above.  In addition, they will also be able to arrange multiple light switches into groups, and control those groups in the same manner – on/off, scheduled times, times based on sunrise/sunset.  A status display showing each of the lights is hoped to be part of this project.

If possible and not too over-ambitious, detailed documentation and videos will be created. 

I doubt there will be time but in an ideal world, a comparison of the cost to manufacture this unit in volume in China versus in the US in my lab would be great!  As currently designed and spec’d, this unit, if a real-world product, would be a complete fail - it is just too costly to make in the US.

I am hoping the ongoing project summary and the depth of the documentation will be of use to fellow developers and makers.  All IP of the project will be open source.


