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
