### Monitoring Audio CD insert/eject with udev
The idea is to create a file in the /tmp/ dir when an audio cd is inserted and to remove it when it's ejected
- Create a udev rules script: /etc/udev/rules.d/99-cd-inserted.rules
- Set the rules
```
#Execute a script when an AUDIO CD is inserted
SUBSYSTEM=="block", KERNEL=="sr0", ACTION=="change", ENV{ID_CDROM_MEDIA_TRACK_COUNT_AUDIO}!="", RUN+="/bin/sh -c 'touch /tmp/audio-cd-in-drive'"

# And when the eject button is pressed
SUBSYSTEM=="block", KERNEL=="sr0", ACTION=="change", ENV{ID_CDROM_MEDIA}=="", RUN+="/bin/sh -c 'rm /tmp/audio-cd-in-drive'"
```
- Reload udev
```
sudo /etc/init.d/udev restart
```

# Enabling CD monitoring on system start
It appears that the new rules will not work on reboot, probably because the /tmp folder is not available at system boot. I've tried to write the ```audio-cd-in-drive``` file to another directory (eg. /var/log/) to circumvent the problem, but I believe this does not work either because the filesystem is mounter in read-only at boot time, when the *udev* service is started.

The solution as for now (19.03.2018), is to use ```/etc/rc.local``` to restart *udev*:
- Create the ```/etc/rc.local``` script, if it does not exist yet
```
sudo echo '#!/bin/sh -e' > /etc/rc.local
sudo chown root /etc/rc.local
sudo chmod 755 /etc/rc.local
```
- Add the command to restart *udev*
```
sudo echo '/etc/init.d/udev restart' >> /etc/rc.local
```
*TODO:* Perform an initial inspection of the CD drive on startup 
