if [[ ${2} =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    versionShort=${BASH_REMATCH[0]}
else
    echo "Something is wrong with the new version"
    exit 1
fi

# Get the current package.json version so it can be replaced
CURRENT_PACKAGE_VERSION=$(jq -r ".version" package.json)

# Replace old version with new version
# package.json
sed "s|${CURRENT_PACKAGE_VERSION}|${2}|g" "./package.json" > "tmp.txt"
cat "tmp.txt" > "./package.json"
# expo
sed "s|${CURRENT_PACKAGE_VERSION}|${2}|g" "./app.json" > "tmp.txt"
cat "tmp.txt" > "./app.json"
# cleanup
rm tmp.txt

# Fastlane task to update the apps version
bundle exec fastlane bump

# # git commit
# git add .
# git commit -m "feat(mobile): release app version v${2}"

# # create git tag for the previous release commit
# git tag "v${2}" HEAD
