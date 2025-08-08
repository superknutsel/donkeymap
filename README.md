# DonkeyMap
Module with markers and contour lines for a certain area.<br />
Can show different markers per category and per tag.<br />
Works with location field from Tassos (acfmap) and also the legacy version (acfosm)  of it. <br />
Works with the YOOtheme Pro location field <br />

## Requirements
- Joomla 5

## Links
- find the relation needed : [www.openstreetmap.org/relation/3123501#map=9/54.1377/-1.3885](https://www.openstreetmap.org/relation/3123501#map=9/54.1377/-1.3885)
- create a polygon : [polygons.openstreetmap.fr](http://polygons.openstreetmap.fr/)
- LeafLet Javascript library : [leafletjs.com](https://leafletjs.com/)

## Tips
- create category polygon and set it to noindex / nofollow
- create and article per polygon with no text editor active in this category and also set in to noindex / nofollow

## Marker Icon Image per article
- create a custom field of the type media
- enter the name of the field in the DonkeyMap module on the tab called Marker (Article marker icon field name).

## Marker priorities
The order the markers are evaluated is :
- Article marker, set inside the article - if set this get's priority
- Category markers - if set with it's own icon this marker is next in line
- Tag markers - use only 1 tag
- Marker default icon



## Customise the content of the marker popup
Create a custom field with the name **donkeymap-popup-content**
In an article you can add in this custom field other custom fields within double curly brackets like this :<br />
>{{custom-field-name}}<br />

Using type editor and set the automatic display to none.

When a field is found with this name the content of it replaces ALL custom field content with the content of that one field. This will be displayed at the end of the popup.
If you want to have some html in the popup make sure you set the Filter to the correct value (for example Safe HTML) in the General tab of the custom field.

You can change the behaviour of the article link on the tab Popup in the module so for example the link opens in a new tab.

## Show image in popup
To turn off the display of the image in the popup create a custom field with the name : **show-article-image-in-map-marker-popup**.
Add two entries with values 0 and 1 to this custom field.
If this field does not exist the image is displayed by default

## Release a new version
Using your command terminal go to  the `packages` folder and execute `./package.sh`
The new file will include the version declared in the module's xml file.

