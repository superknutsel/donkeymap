<?php

/**
 * Joomla! Content Management System
 *
 * @copyright  (C) 2010 Open Source Matters, Inc. <https://www.joomla.org>
 * @license        GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\DonkeyMap\Site\Form\Field;

use Joomla\CMS\Form\Field\ListField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Layout\FileLayout;
use Joomla\Filesystem\File;
use Joomla\Filesystem\Folder;
use Joomla\Filesystem\Path;

// phpcs:disable PSR1.Files.SideEffects
\defined('JPATH_PLATFORM') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Supports an HTML select list of files
 *
 * @since  1.7.0
 */
class FilelistuploadField extends ListField
{
    /**
     * The form field type.
     *
     * @var    string
     * @since  1.7.0
     */
    protected $type = 'Filelistupload';

    /**
     * The filename filter.
     *
     * @var    string
     * @since  4.0.0
     */
    protected $fileFilter;

    /**
     * The exclude.
     *
     * @var    string
     * @since  3.2
     */
    protected $exclude;

    /**
     * The hideNone.
     *
     * @var    boolean
     * @since  3.2
     */
    protected $hideNone = false;

    /**
     * The hideDefault.
     *
     * @var    boolean
     * @since  3.2
     */
    protected $hideDefault = false;

    /**
     * The stripExt.
     *
     * @var    boolean
     * @since  3.2
     */
    protected $stripExt = false;

    /**
     * The directory.
     *
     * @var    string
     * @since  3.2
     */
    protected $directory;

    /**
     * The accepted file type list.
     *
     * @var    mixed
     * @since  3.2
     */
    protected $accept;

    /**
     * Name of the layout being used to render the field
     *
     * @var    string
     * @since  3.6
     */
    protected $layout = 'mod_donkey_map.form.field.fileuploadlist';

    /**
     * Method to get certain otherwise inaccessible properties from the form field object.
     *
     * @param   string  $name  The property name for which to get the value.
     *
     * @return  mixed  The property value or null.
     *
     * @since   3.2
     */
    public function __get($name)
    {
        switch ($name) {
            case 'fileFilter':
            case 'exclude':
            case 'hideNone':
            case 'hideDefault':
            case 'stripExt':
            case 'directory':
            case 'accept':
                return $this->$name;
        }

        return parent::__get($name);
    }

    /**
     * Method to set certain otherwise inaccessible properties of the form field object.
     *
     * @param   string  $name   The property name for which to set the value.
     * @param   mixed   $value  The value of the property.
     *
     * @return  void
     *
     * @since   3.2
     */
    public function __set($name, $value)
    {
        switch ($name) {
            case 'fileFilter':
            case 'directory':
            case 'exclude':
            case 'accept':
                $this->$name = (string)$value;
                break;

            case 'hideNone':
            case 'hideDefault':
            case 'stripExt':
                $value       = (string)$value;
                $this->$name = ($value === 'true' || $value === $name || $value === '1');
                break;

            default:
                parent::__set($name, $value);
        }
    }

    /**
     * Method to attach a Form object to the field.
     *
     * @param   \SimpleXMLElement  $element  The SimpleXMLElement object representing the `<field>` tag for the form field
     *                                       object.
     * @param   mixed              $value    The form field value to validate.
     * @param   string             $group    The field name group control value. This acts as an array container for the
     *                                       field. For example if the field has name="foo" and the group value is set to
     *                                       "bar" then the full field name would end up being "bar[foo]".
     *
     * @return  boolean  True on success.
     *
     * @see     FormField::setup()
     * @since   3.2
     */
    public function setup(\SimpleXMLElement $element, $value, $group = null)
    {
        $return = parent::setup($element, $value, $group);

        if ($return) {
            $this->fileFilter = (string)$this->element['fileFilter'];
            $this->exclude    = (string)$this->element['exclude'];

            $hideNone       = (string)$this->element['hide_none'];
            $this->hideNone = ($hideNone === 'true' || $hideNone === 'hideNone' || $hideNone === '1');

            $hideDefault       = (string)$this->element['hide_default'];
            $this->hideDefault = ($hideDefault === 'true' || $hideDefault === 'hideDefault' || $hideDefault === '1');

            $stripExt       = (string)$this->element['stripext'];
            $this->stripExt = ($stripExt === 'true' || $stripExt === 'stripExt' || $stripExt === '1');

            // Get the path in which to search for file options.
            $this->directory = (string)$this->element['directory'];

            $this->accept = (string)$this->element['accept'];
        }

        return $return;
    }

    /**
     * Method to get the list of files for the field options.
     * Specify the target directory with a directory attribute
     * Attributes allow an exclude mask and stripping of extensions from file name.
     * Default attribute may optionally be set to null (no file) or -1 (use a default).
     *
     * @return  array  The field option objects.
     *
     * @since   1.7.0
     */
    protected function getOptions()
    {
        $options = [];

        $path = $this->directory;

        if (!is_dir($path)) {
            $path = JPATH_ROOT . '/' . $path;
        }

        $path = Path::clean($path);

        // Prepend some default options based on field attributes.
        if (!$this->hideNone) {
            $options[] = HTMLHelper::_(
                'select.option',
                '-1',
                Text::alt('JOPTION_DO_NOT_USE', preg_replace('/[^a-zA-Z0-9_\-]/', '_', $this->fieldname))
            );
        }

        if (!$this->hideDefault) {
            $options[] = HTMLHelper::_(
                'select.option',
                '',
                Text::alt('JOPTION_USE_DEFAULT', preg_replace('/[^a-zA-Z0-9_\-]/', '_', $this->fieldname))
            );
        }

        // Get a list of files in the search path with the given filter.
        $files = file_exists($path) ? Folder::files($path, $this->fileFilter) : [];

        // Build the options list from the list of files.
        if (\is_array($files)) {
            foreach ($files as $file) {
                // Check to see if the file is in the exclude mask.
                if ($this->exclude) {
                    if (preg_match(\chr(1) . $this->exclude . \chr(1), $file)) {
                        continue;
                    }
                }

                // If the extension is to be stripped, do it.
                if ($this->stripExt) {
                    $file = File::stripExt($file);
                }

                $options[] = HTMLHelper::_('select.option', $file, $file);
            }
        }

        // Merge any additional options in the XML definition.
        $options = array_merge(parent::getOptions(), $options);

        return $options;
    }

    /**
     * Method to get the field input markup for the file field.
     * Field attributes allow specification of a maximum file size and a string
     * of accepted file extensions.
     *
     * @return  string  The field input markup.
     *
     * @note    The field does not include an upload mechanism.
     * @see     \Joomla\CMS\Form\Field\MediaField
     * @since   1.7.0
     */
    protected function getInput()
    {
        return $this->getRenderer($this->layout)->render($this->getLayoutData());
    }

    /**
     * Method to get the data to be passed to the layout for rendering.
     *
     * @return  array
     *
     * @since   3.6
     */
    protected function getLayoutData()
    {
        $data = parent::getLayoutData();

        $extraData = [
            'fieldName' => (string)$this->element['name'],
            'options'   => $this->getOptions(),
            'accept'    => $this->accept,
            'multiple'  => $this->multiple,
            'fileFilter' => $this->fileFilter,
            'directory' => $this->directory
        ];

        return array_merge($data, $extraData);
    }

    protected function getLayoutPaths()
    {
        $renderer = new FileLayout('default');

        return [JPATH_ROOT . '/modules/mod_donkey_map/layouts', ...$renderer->getDefaultIncludePaths()];
    }
}
