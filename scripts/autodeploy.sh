#!/bin/sh
if [ -z "$ENTER_NETWORK" ]
then
  echo "Variable \$ENTER_NETWORK is not set"
  exit 1
fi

if [ -z "$EXIT_NETWORK" ]
then
  echo "Variable \$EXIT_NETWORK is not set"
  exit 1
fi

echo "Starting to deploy on networks [${ENTER_NETWORK}-${EXIT_NETWORK}]"

export TS_NODE_TRANSPILE_ONLY=1

hh deploy --network $ENTER_NETWORK
hh deploy --network $EXIT_NETWORK
hh run --network $ENTER_NETWORK scripts/issueTokens.ts
hh run --network $EXIT_NETWORK scripts/issueTokens.ts
hh run --network $ENTER_NETWORK scripts/initCosigners.ts
hh run --network $EXIT_NETWORK scripts/initCosigners.ts
hh run --network $ENTER_NETWORK scripts/transferOwnerships.ts
hh run --network $EXIT_NETWORK scripts/transferOwnerships.ts

unset TS_NODE_TRANSPILE_ONLY

echo "Deployment done!"
