<?php

namespace Joomla\Module\DonkeyMap\Site\Form\Rule;

use Joomla\CMS\Form\Form;
use Joomla\CMS\Form\FormRule;
use Joomla\CMS\Language\Text;
use Joomla\Registry\Registry;

class ValidPolygonJsonRule extends FormRule
{
    public function test(\SimpleXMLElement $element, $value, $group = null, Registry $input = null, Form $form = null)
    {
        $folder = strtolower(trim((string)$element['directory'] ?? ''));

        try {
            $folder = trim(str_replace(JPATH_ROOT, '', $folder), '\\/');
            $filePath = JPATH_ROOT . '/' . trim($folder, '\\/') . '/' . trim($value, '\\/');

            $this->checkContent($filePath);

            return true;
        } catch (\RuntimeException $e) {
            $element->addAttribute('message', $e->getMessage());

            return false;
        }
    }

    public function checkContent(string $filePath): void
    {
        if (!is_file($filePath)) {
            throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_UPLOADED_FILE_NOT_FOUND'));
        }

        $o = json_decode(file_get_contents($filePath));

        if (($o->type ?? '') !== 'GeometryCollection'
            || !is_array($o->geometries)
            || !count($o->geometries)
            || ($o->geometries[0]->type ?? '') !== 'MultiPolygon'
            || !is_array($o->geometries[0]->coordinates)
            || !count($o->geometries[0]->coordinates)) {
            throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_SELECTED_FILE_NOT_A_POLYGON'));
        }
    }
}