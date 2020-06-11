if [[ ${2} =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    versionShort=${BASH_REMATCH[0]}
else
    echo "Something is wrong with the new version"
    exit 1
fi

# Replace old version with new version
# expo
sed "s|${1}|${2}|g" "./app.json" > "tmp.txt"
cat "tmp.txt" > "./app.json"
# ios
sed "s|${1}|${2}|g" "./ios/myproject/Info.plist" > "tmp.txt"
cat "tmp.txt" > "./ios/myproject/Info.plist"
# android
sed "s|${1}|${2}|g" "./android/app/build.gradle" > "tmp.txt"
cat "tmp.txt" > "./android/app/build.gradle"
# cleanup
rm tmp.txt

# git commit
git add "./app.json"
git add "./ios/myproject/Info.plist"
git add "./android/app/build.gradle"
git commit -m "feat(mobile): release app version v${2}"

# create git tag for the previous release commit
git tag "v${2}" HEAD
