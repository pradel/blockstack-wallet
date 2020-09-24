NEW_VERSION=${1}

if [[ ${NEW_VERSION} =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    versionShort=${BASH_REMATCH[0]}
else
    echo "Something is wrong with the new version"
    exit 1
fi

# Get the current package.json version so it can be replaced
CURRENT_PACKAGE_VERSION=$(jq -r ".version" package.json)

# Replace old version with new version
# package.json
jq --arg version ${NEW_VERSION} '.version = $version' package.json > "tmp.txt" && mv "tmp.txt" package.json
# expo
jq --arg version ${NEW_VERSION} '.expo.version = $version' app.json > "tmp.txt" && mv "tmp.txt" app.json
# Fastlane task to update the apps version
cd fastlane
bundle exec fastlane bump

# git commit
git add .
git commit -m "feat(mobile): release app version v${2}"

# create git tag for the previous release commit
git tag "v${NEW_VERSION}" HEAD
