#! /bin/bash

# exit when any command fails
set -e

### Increments the part of the string
## $1: version itself
## $2: number of part: 0 – major, 1 – minor

increment_version() {
  local delimiter=.
  local array=($(echo "$1" | sed "s/^v//"| tr $delimiter '\n'))
  array[$2]=$((array[$2]+1))
  if [ $2 -lt 1 ]; then array[1]=0; fi
  echo $(local IFS=$delimiter ; echo "v${array[*]}")
}

version=$(git tag --sort=taggerdate | tail -1)
newVersion=$(increment_version "$version" 1)

echo "version    : ${version}"
echo "new version: ${newVersion}"


npm run dist
git add -A
git commit -m "release ${newVersion}"
git push
git tag -a -m "${newVersion}" ${newVersion}
git push --follow-tags

