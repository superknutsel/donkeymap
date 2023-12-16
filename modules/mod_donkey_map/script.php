<?php
/**
 * @package    La Connexion Facebook System Plugin
 *
 * @author     Pieter-Jan de Vries/Obix webtechniek <pieter@obix.nl>
 * @copyright  Copyright © 2022 Obix webtechniek. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       https://www.obix.nl
 */

defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;
use Obix\Facebook\Conversion\Server\Helper\ConversionHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Installer\InstallerAdapter;

/**
 * La Connexion Facebook System Plugin script file.
 *
 * @package   La Connexion Facebook System Plugin
 * @since     1.0.0
 */
class mod_donkey_mapInstallerScript
{
    protected string $minimumJoomla = '4.0';
    protected string $minimumPhp = '8.0';

	/**
	 * Called after any type of action
	 *
	 * @param   string            $route    Which action is happening
	 *                                      (install|uninstall|discover_install|update)
	 * @param   InstallerAdapter  $adapter  The object responsible for running
	 *                                      this script
	 *
	 * @return  boolean  True on success
	 */
    public function postflight($action, $adapter): void
	{
        // Enable plugin on first installation only.
        if ($action === 'install' || $action === 'discover_install')
        {
            $this->publish();
        }
    }

	public function publish()
	{
		$db    = Factory::getDbo();
		$query = sprintf(
			'UPDATE %s SET %s = 1 WHERE %s = %s AND %s = %s',
			$db->quoteName('#__extensions'),
			$db->quoteName('enabled'),
			$db->quoteName('type'), $db->quote('module'),
			$db->quoteName('name'), $db->quote('MOD_DONKEY_MAP')
		);
		$db->setQuery($query);
		$db->execute();
	}
}
