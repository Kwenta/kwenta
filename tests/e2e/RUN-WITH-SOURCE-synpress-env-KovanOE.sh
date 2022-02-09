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

sourced=0

if [ -n "$ZSH_EVAL_CONTEXT" ]; then 
  case $ZSH_EVAL_CONTEXT in *:file) sourced=1;; esac
elif [ -n "$KSH_VERSION" ]; then
  [ "$(cd $(dirname -- $0) && pwd -P)/$(basename -- $0)" != "$(cd $(dirname -- ${.sh.file}) && pwd -P)/$(basename -- ${.sh.file})" ] && sourced=1
elif [ -n "$BASH_VERSION" ]; then
  (return 0 2>/dev/null) && sourced=1 
else # All other shells: examine $0 for known shell binary filenames
  # Detects `sh` and `dash`; add additional shell filenames as needed.
  case ${0##*/} in sh|dash) sourced=1;; esac
fi

{
if [ $sourced -eq 0 ]; then
    echo "You need to run this script using the 'source' command in order for the environment variables being set in your calling shell. "
    echo "Example: source $0"
    return 1 2>/dev/null
    exit 1
fi
}

{
if [ ! -f ./SYNPRESS_PRIVATEKEY ]; then
    echo "File SYNPRESS_PRIVATEKEY not found. Put the private key of your test wallet into this file in the same directory where this script is located and try again."
    return 1 2>/dev/null
    exit 1
fi
}

PRIVATE_KEY=$(cat "./SYNPRESS_PRIVATEKEY") 

#export SECRET_WORDS='does,not,work,use,private,key' running synpress with seedphrase doesnt work as synpress sets up metamask with secret words once set. However, this leads to an error that crashes the test.
export PRIVATE_KEY=$PRIVATE_KEY
export NETWORK_NAME=OptimisticKovan
export RPC_URL=https://kovan.optimism.io
export CHAIN_ID=69
export BLOCK_EXPLORER=https://kovan-optimistic.etherscan.io
export IS_TESTNET=true

echo "Environment variables set to run Kwenta e2e Optimismic Kovan tests using Synpress!"