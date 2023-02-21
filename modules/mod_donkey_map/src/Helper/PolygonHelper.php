<?php

namespace Joomla\Module\DonkeyMap\Site\Helper;

use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Language\Text;
use Joomla\Module\DonkeyMap\Site\Form\Rule\ValidPolygonJsonRule;

/**
 * Helper for mod_donkey_map for uploading of outline polygon files.
 */
class PolygonHelper
{
    /**
     * @var \Joomla\CMS\Application\CMSApplicationInterface
     */
    private CMSApplicationInterface $app;

    /**
     * A list of acceptible mime types.
     *
     * @var array
     */
    private array $allowedMimeTypes = [];

    /**
     * A list of acceptible file types.
     * see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     *
     * @var array
     */
    private array $acceptableFileTypes = [];

    /**
     * @param   \Joomla\CMS\Application\CMSApplicationInterface  $app
     */
    public function __construct(CMSApplicationInterface $app)
    {
        $this->app = $app;
    }

    /**
     * Handles a file upload.
     *
     * @return void
     */
    public function upload(): void
    {
        $input = $this->app->getInput();

        // Get the
        $uploadedFile = $input->files->get('polygons', [], 'ARRAY');
        $uploadParams         = $input->get('upload_params', [], 'ARRAY');

        if ($accept = ($uploadParams['accept'] ?? '')) {
            $this->setAcceptableFileTypes(explode(',', $accept));
        }

        // Perform various general upload checks.
        $this->checkUpload($uploadedFile);

        // Use validation rule to check file contents of uploaded file for valid polygon.
        (new ValidPolygonJsonRule())->checkContent($uploadedFile['tmp_name']);

        $this->move(
            $uploadedFile['tmp_name'],
            $uploadedFile['name'],
            ($uploadParams['directory'] ?? '') ?: '/media/mod_donkey_map/polygons'
        );
    }

    /**
     * @param   string  $tmpPath
     * @param   string  $newName
     * @param   string  $newFolder
     *
     * @return void
     */
    private function move(string $tmpPath, string $newName, string $newFolder): void
    {
        // Trim any (back)slashes from arguments.
        $newFolder  = trim(str_replace(JPATH_ROOT, '', $newFolder), '\\/');
        $moveToPath = JPATH_ROOT . '/' . trim($newFolder, '\\/') . '/' . trim($newName, '\\/');

        if (!file_exists($newFolder)) {
            mkdir($newFolder, 0755, true);
        }

        if (!move_uploaded_file($tmpPath, $moveToPath)) {
            throw new \RuntimeException('Failed to move uploaded file.');
        }
    }

    /**
     * @param   array  $uploadedFile
     *
     * @return void
     */
    private function checkUpload(array $uploadedFile): void
    {
        // Check for errors in $_FILES parameters.
        if (!isset($uploadedFile['error']) || is_array($uploadedFile['error'])) {
            throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_INVALID_PARAMETERS'));
        }

        if (!$this->sizeInBytes($uploadedFile['size'])) {
            throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_UPLOADED_FILE_IS_EMPTY'));
        }

        $maxFileSize = ini_get('upload_max_filesize');

        // Check for existance of file and file size.
        switch ($uploadedFile['error']) {
            case UPLOAD_ERR_OK:
                break;

            case UPLOAD_ERR_NO_FILE:
                throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_NO_FILE'));

            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new \RuntimeException(Text::sprintf('MOD_DONKEY_MAP_UPLOAD_ERROR_MAX_SIZE_EXCEEDED', $maxFileSize));

            default:
                throw new \RuntimeException(Text::_('MOD_DONKEY_MAP_UPLOAD_ERROR_UNKNOWN'));
        }

        if ($this->sizeInBytes($uploadedFile['size']) > $this->sizeInBytes($maxFileSize)) {
            throw new \RuntimeException(Text::sprintf('MOD_DONKEY_MAP_UPLOAD_ERROR_MAX_SIZE_EXCEEDED', $maxFileSize));
        }

        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($uploadedFile['tmp_name']) ?: Text::_('MOD_DONKEY_MAP_MIMETYPE_UNKNOWN');

        if (count($this->allowedMimeTypes) && array_search($mimeType, $this->allowedMimeTypes, true) === false) {
            throw new \RuntimeException(
                Text::sprintf(
                    'MOD_DONKEY_MAP_UPLOAD_ERROR_INVALID_MIME_TYPE',
                    $mimeType,
                    implode(', ', $this->allowedMimeTypes)
                )
            );
        }

        if ($extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION)) {
            $extension = '.' . $extension;
        }

        $globMime = '';

        if ($mimeType && ($pos = strpos($mimeType, '/')) !== false) {
            $globMime = substr($mimeType, 0, $pos) . '/*';
        }

        if (count($this->acceptableFileTypes)
            && $extension
            && array_search($extension, $this->acceptableFileTypes, true) === false
            && (
                ($mimeType && array_search($mimeType, $this->acceptableFileTypes, true) === false)
                || ($globMime && array_search($globMime, $this->acceptableFileTypes, true) === false)
            )) {
            throw new \RuntimeException(
                Text::sprintf(
                    'MOD_DONKEY_MAP_UPLOAD_ERROR_UNACCEPTABLE_FILE_TYPE',
                    implode(', ', $this->acceptableFileTypes)
                )
            );
        }
    }

    /**
     * @param   string  $size
     *
     * @return int
     */
    public function sizeInBytes(string $size): int
    {
        static $exp = [
            'B' => 0,
            'K' => 1,
            'M' => 2,
            'G' => 3,
            'T' => 4,
        ];

        $intSize = (int)$size;
        $unit    = str_replace((string)$intSize, '', $size) ?: 'B';

        return $unit === 'B' ? $intSize : $intSize * (1024 ** $exp[$unit]);
    }

    /**
     * @return array
     */
    public function getAllowedMimeTypes(): array
    {
        return $this->allowedMimeTypes;
    }

    /**
     * @param   array  $allowedMimeTypes
     *
     * @return PolygonHelper
     */
    public function setAllowedMimeTypes(array $allowedMimeTypes): static
    {
        $this->allowedMimeTypes = array_map(fn(string $type) => trim($type), $allowedMimeTypes);

        return $this;
    }

    /**
     * @param   string  $allowedMimeType
     *
     * @return PolygonHelper
     */
    public function addValidMimeType(string $allowedMimeType): static
    {
        $this->allowedMimeTypes[] = trim($allowedMimeType);
        $this->allowedMimeTypes   = array_unique($this->allowedMimeTypes);

        return $this;
    }

    /**
     * @return array
     */
    public function getAcceptableFileTypes(): array
    {
        return $this->acceptableFileTypes;
    }

    /**
     * @param   array  $acceptableFileTypes
     *
     * @return PolygonHelper
     */
    public function setAcceptableFileTypes(array $acceptableFileTypes): static
    {
        $this->acceptableFileTypes = array_map(fn(string $type) => trim($type), $acceptableFileTypes);

        return $this;
    }

    /**
     * @param   string  $acceptableFileType
     *
     * @return PolygonHelper
     */
    public function addAcceptableFileType(string $acceptableFileType): static
    {
        $this->acceptableFileTypes[] = trim($acceptableFileType);
        $this->acceptableFileTypes   = array_unique($this->acceptableFileTypes);

        return $this;
    }

    /**
     * @return callable[]
     */
    public function getMoreChecks(): array
    {
        return $this->moreChecks;
    }

    /**
     * @param   callable[]  $moreChecks
     *
     * @return PolygonHelper
     */
    public function setMoreChecks(array $moreChecks): static
    {
        $this->moreChecks = $moreChecks;

        return $this;
    }

    /**
     * @param   callable  $check
     *
     * @return PolygonHelper
     */
    public function addCheck(callable $check): static
    {
        $this->moreChecks[] = $check;

        return $this;
    }
}