<?php

/**
 * @package         Joomla.Site
 * @subpackage      Layout
 *
 * @copyright   (C) 2018 Open Source Matters, Inc. <https://www.joomla.org>
 * @license         GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;
use Joomla\CMS\Utility\Utility;

extract($displayData);

/**
 * Layout variables
 * -----------------
 *
 * @var   string  $autocomplete   Autocomplete attribute for the field.
 * @var   boolean $autofocus      Is autofocus enabled?
 * @var   string  $class          Classes for the input.
 * @var   string  $description    Description of the field.
 * @var   boolean $disabled       Is this field disabled?
 * @var   string  $fieldName      Raw fieldname
 * @var   string  $group          Group the field belongs to. <fields> section in form XML.
 * @var   boolean $hidden         Is this field hidden in the form?
 * @var   string  $hint           Placeholder for the field.
 * @var   string  $id             DOM id of the field.
 * @var   string  $label          Label of the field.
 * @var   string  $labelclass     Classes to apply to the label.
 * @var   boolean $multiple       Does this field support multiple values?
 * @var   string  $name           Name of the input field.
 * @var   string  $onchange       Onchange attribute for the field.
 * @var   string  $onclick        Onclick attribute for the field.
 * @var   string  $pattern        Pattern (Reg Ex) of value of the form field.
 * @var   boolean $readonly       Is this field read only?
 * @var   boolean $repeat         Allows extensions to duplicate elements.
 * @var   boolean $required       Is this field required?
 * @var   integer $size           Size attribute of the input.
 * @var   boolean $spellcheck     Spellcheck state for the form field.
 * @var   string  $validate       Validation rules to apply.
 * @var   string  $value          Value attribute of the field.
 * @var   array   $checkedOptions Options that will be set as checked.
 * @var   boolean $hasValue       Has this field a value assigned?
 * @var   array   $options        Options available for this field.
 * @var   array   $inputType      Options available for this field.
 * @var   string  $accept         File types that are accepted.
 * @var   string  $dataAttribute  Miscellaneous data attributes preprocessed for HTML output
 * @var   array   $dataAttributes Miscellaneous data attribute for eg, data-*
 */

$html = [];

$fileList = [];
$attr     = '';

// Initialize the field attributes.
$attr .= !empty($class) ? ' class="form-select ' . $class . '"' : ' class="form-select"';
$attr .= !empty($size) ? ' size="' . $size . '"' : '';
$attr .= $multiple ? ' multiple' : '';
$attr .= $required ? ' required' : '';
$attr .= $autofocus ? ' autofocus' : '';
$attr .= $onchange ? ' onchange="' . $onchange . '"' : '';
$attr .= !empty($description) ? ' aria-describedby="' . ($id ?: $name) . '-desc"' : '';
$attr .= $dataAttribute;

// To avoid user's confusion, readonly="readonly" should imply disabled="disabled".
if ($readonly || $disabled) {
    $attr .= ' disabled="disabled"';
}

// Create a read-only list (no name) with hidden input(s) to store the value(s).
if ($readonly) {
    $fileList[] = HTMLHelper::_('select.genericlist', $options, '', trim($attr), 'value', 'text', $value, $id);

    // E.g. form field type tag sends $this->value as array
    if ($multiple && is_array($value)) {
        if (!count($value)) {
            $value[] = '';
        }

        foreach ($value as $val) {
            $fileList[] = '<input type="hidden" name="' . $name . '" value="' . htmlspecialchars($val, ENT_COMPAT, 'UTF-8')
                . '">';
        }
    } else {
        $fileList[] = '<input type="hidden" name="' . $name . '" value="' . htmlspecialchars($value, ENT_COMPAT, 'UTF-8')
            . '">';
    }
} else // Create a regular list passing the arguments in an array.
{
    $listoptions                   = [];
    $listoptions['option.key']     = 'value';
    $listoptions['option.text']    = 'text';
    $listoptions['list.select']    = $value;
    $listoptions['id']             = $id;
    $listoptions['list.translate'] = false;
    $listoptions['option.attr']    = 'optionattr';
    $listoptions['list.attr']      = trim($attr);
    $fileList[]                    = HTMLHelper::_('select.genericlist', $options, $name, $listoptions);
}

$attr
    = (!empty($size) ? ' size="' . $size . '"' : '')
    . (!empty($accept) ? ' accept="' . $accept . '"' : '')
    . (!empty($class) ? ' class="form-control ' . $class . '"' : ' class="form-control"')
    . (!empty($multiple) ? ' multiple' : '')
    . ($disabled ? ' disabled' : '')
    . ($autofocus ? ' autofocus' : '')
    . (!empty($onchange) ? ' onchange="' . $onchange . '"' : '')
    . ($required ? ' required' : '');

$maxSize = Text::sprintf('JGLOBAL_MAXIMUM_UPLOAD_SIZE_LIMIT', HTMLHelper::_('number.bytes', Utility::getMaxUploadSize()));

$uploadId    = $id . '_upload';
$uploadName  = preg_replace('/jform(.*)\[([^]]+)\]/', 'jform$1[$2_upload]', $name);
$uploadField = "<input type=\"file\" name=\"$uploadName\" id=\"$uploadId\" $attr><br>$maxSize";

$messageContainerId = 'donkeymap-upload-message-container-' . $id;
$messageContainer   = '<div id="' . $messageContainerId . '"></div>';

$uploadTriggerId = $uploadId . '_trigger';
$uploadTrigger   = "<button id=\"$uploadTriggerId\" class=\"btn btn-secondary donkey-map-upload-trigger\" type=\"button\">" . Text::_(
        'MOD_DONKEY_MAP_FIELD_MAP_POLYGON_UPLOAD_LABEL'
    ) . "</button>";

$html = [
    '<div class="control-group donkey-map-upload-group">',
    '<div class="donkey-map-upload-list-field">',
    $uploadTrigger,
    implode($fileList),
    '</div>',
    $uploadField,
    '</div>',
    $messageContainer,
];

echo implode($html);

/** @var Joomla\CMS\WebAsset\WebAssetManager $wam */
$wam = Factory::getApplication()->getDocument()->getWebAssetManager();
$wam->registerAndUseStyle(
    'donkey_map_admin.css',
    'mod_donkey_map/donkey_map_admin.min.css',
);
$wam->registerAndUseScript(
    'donkey_map_admin.js',
    'mod_donkey_map/donkey_map_admin.min.js',
    []
);
$uploadUrl    = Uri::root() . 'index.php?option=com_ajax&format=json&module=donkey_map';
$uploadParams = json_encode([
    'directory'                => $directory,
    'fileFilter'               => $fileFilter,
    'accept'                   => $accept,
    'multiple'                 => $multiple,
    'messageContainerSelector' => '#' . $messageContainerId,
]);

echo <<<JS
<script>
    document.addEventListener('DOMContentLoaded', e => {
        const uploadHandler = Obix.DonkeyMapHelper.createUploadHandler("$id", "$uploadId", "$uploadTriggerId", "$uploadUrl", $uploadParams);
        
        uploadHandler.setup();
    });
</script>
JS;
