# DonkeyMap
Module with markers and contour lines for a certain area.
Can show different markers per category and per tag.

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
- Category markers
- Marker default icon
- Article marker, set inside the article
- Tag markers


## Customise the content of the marker pop-up
Create a custom field with the name **donkeymap-pop-up-content**
In an article you can add in this custom field other custom fields within double curly brackets like this :<br />
>{{custom-field-name}}<br />

When a field is found with this name the content of it replaces ALL custom field content with the content of that one field. This will be displayed at the end of the pop-up.
If you want to have some html in the pop-up make sure you set the Filter to the correct value (for example Safe HTML) in the General tab of the custom field.

## Show image in popup
To turn off the display of the image in the pop-up create a custom field with the name : **show-article-image-in-map-marker-pop-up**.
Add two entries with values 0 and 1 to this custom field.
If this field does not exist the image is displayed by default
