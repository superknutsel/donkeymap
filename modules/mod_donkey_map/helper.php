<?php

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Response\JsonResponse;
use Joomla\Module\DonkeyMap\Site\Helper\DonkeyMapHelper;
use Joomla\Module\DonkeyMap\Site\MVC\PolygonSpecificationModel;

class ModDonkeyMapHelper
{
    public static function getAjax()
    {
        // Handle classic errors as exceptions.
        set_error_handler(
            fn(int $errno, string $errstr, string $errfile = '', int $errline = 0) => self::errorHandler(
                $errno,
                $errstr,
                $errfile,
                $errline
            )
        );

        $app = Factory::getApplication();

        try {
            $input = $app->getInput();
            $action = $input->getCmd('donkey-map-ajax-cmd');

            switch ($action) {
                case 'upload':
                    (new PolygonSpecificationModel($app))->save();
                    break;
            }
        } catch (\ErrorException $e) {
            // Handle exceptions thrown by custom error handler.
            if (in_array($e->getSeverity(), [E_USER_ERROR, E_RECOVERABLE_ERROR])) {
                // Handle these as fatal.
                // Respond unsuccessful including the main cause.
                echo new JsonResponse([], $e->getMessage(), true, false);
            } else {
                // Handle the rest as successful with a twist.
                // Respond successful including theexception message.
                echo new JsonResponse([], $e->getMessage(), false, $input->get('ignoreMessages', true, 'bool'));
            }

            $app->close();
        } catch (\Exception $e) {
            // Handle any other runtime exception.
            // Respond unsuccessful including the main cause.
            echo new JsonResponse([], $e->getMessage(), true, false);
            $app->close();
        }

        // No errors or exceptions.
        // Respond successful and nothing else.
        echo new JsonResponse([], Text::_('MOD_DONKEY_MAP_UPLOAD_SUCCEEDED'), false, true);
        $app->close();
    }

    private static function errorHandler(int $errno, string $errstr, string $errfile = '', int $errline = 0): bool
    {
        // error was suppressed with the @-operator
        if (!(error_reporting() === 0 & $errno)) {
            return false;
        }

        throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
    }
}