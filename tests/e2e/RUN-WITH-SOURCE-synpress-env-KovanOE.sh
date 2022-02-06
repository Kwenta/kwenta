#!/bin/bash
# this small scripts sets all the required environment variables for Synpress
# For Optimismtic Kovan
#
# Kwenta uses Synpress (a wrapper around Cypress) to run full end-to-end tests
# On Linux environment this scripts must be called using ". ./synpress-env.sh"

unset PRIVATE_KEY
unset NETWORK_NAME
unset RPC_URL
unset CHAIN_ID
unset BLOCK_EXPLORER
unset IS_TESTNET

{
if [ ! -f ./TEST-PRIVATEKEY ]; then
    echo "File TEST-PRIVATEKEY not found. Put the private key of your test wallet into this file in the same directory where this script is located and try again."
    return 1 2>/dev/null
    exit 1
fi
}

PRIVATE_KEY=$(cat "./TEST-PRIVATEKEY") 

#export SECRET_WORDS='does,not,work,use,private,key' running synpress with seedphrase doesnt work as synpress sets up metamask with secret words once set. However, this leads to an error that crashes the test.
export PRIVATE_KEY=$PRIVATE_KEY
export NETWORK_NAME=OptimisticKovan
export RPC_URL=https://kovan.optimism.io
export CHAIN_ID=69
export BLOCK_EXPLORER=https://kovan-optimistic.etherscan.io
export IS_TESTNET=true

echo "Environment variables set to run Kwenta e2e Optimismic Kovan tests using Synpress!"