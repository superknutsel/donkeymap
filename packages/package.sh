baseDir=/home/pieter-jan/projects/delinie-ict/donkeymap
packageDir=$baseDir/packages

exclude=".git .gitignore \*update*.xml"

moduleDir=$baseDir/modules/mod_donkey_map
moduleName=mod_donkey_map
moduleVersion=$(grep '<version>' ${moduleDir}/${moduleName}.xml | sed -r 's#^\s*<version>(.*)</version>\s*$#\1#')
modulePackageName=${moduleName}-${moduleVersion}
package=$packageDir/${modulePackageName}.zip

[ -f $package ] && rm $package
cd $moduleDir
zip -r $package * --exclude $exclude

## Package
#sed -f - $packageDir/$modulePackageName.xml >$versionDir/$modulePackageName.xml <<SED_SCRIPT
#    s/{{version}}/$version/g
#SED_SCRIPT
#
#cd $versionDir
#[ -f $modulePackageName-$version.zip ] && rm $modulePackageName-$version.zip
#zip -r $modulePackageName-$version.zip $modulePackageName.xml *.zip --exclude $exclude