# Anime video control plugin (AVC)
### Description:
Plugin offers addititional control over video content on site https://amedia.online.
It includes:
1. AD block;
2. Additional control panel;
3. Additional navigation buttons (previous/next episode and refresh);
4. Ability to set start time for all episodes;
5. Ability to set end time for all episodes;
6. Ability to set warn time (when video turns to the next episode) for all episodes;
7. Autoscroll to video player;
8. Autoplay;
9. Auto fullscreen video mode in one single click;
10. Auto play next episode;
11. Persist data for every anime.
### System requirements:
Firefox 118.0.2
### Insatallation
Steps to install:
1. Clone this repositorty.  
```git clone git@github.com:EvgenyGH/video-control-2.git```
2. Put files to zip archive. Example with 7-zip:  
```7z.exe a -tzip plugin.zip * -x!*.gitignore```
3. Make Firefox install Unsigned Extensions (or sign it:)).   
For this:  
Type about:config into the URL bar in Firefox In the Search box type 
xpinstall.signatures.required. Double-click the preference, or 
right-click and selected “Toggle”, to set it to False.
4. Load extension to Firefox from the file.  
For this:  
Open the Add-ons Manger > click on the gear icon (Tools for all add-ons) > 
Install Add-on From File.. > browse to the add-on > 
double click the add-on (or select Open) > Install Now.
5. Give host permissions.  
For this:  
Click the menu button, click Add-ons and themes and select Extensions.
Click on the name of the extension to see more details. Select Permissions 
to see all permissions requested by the extension. Turn each permission on
with the toggle switch. 
6. Allow autoplay:  
For this follow [Firefox instructions](https://support.mozilla.org/en-US/kb/block-autoplay)
7. Have fun!