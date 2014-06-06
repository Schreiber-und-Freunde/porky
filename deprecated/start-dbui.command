#!/bin/bash
## Linux
LSOF=$(lsof -p $$ | grep -E "/"$(basename $0)"$")
MY_PATH=$(echo $LSOF | sed -r s/'^([^\/]+)\/'/'\/'/1 2>/dev/null)
if [ $? -ne 0 ]; then
## OSX
MY_PATH=$(echo $LSOF | sed -E s/'^([^\/]+)\/'/'\/'/1 2>/dev/null)
fi

MY_PID=$$
MY_ROOT=$(dirname $MY_PATH)
MY_NAME=$(basename $0)

echo -e "PATH\t$MY_PATH"
echo -e "FILE\t$MY_NAME"
echo -e "CWD \t$MY_ROOT"
echo -e "PID \t$MY_PID"

php "$MY_ROOT"/DBUI-2.0.php