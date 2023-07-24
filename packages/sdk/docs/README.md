@kwenta/sdk / [Modules](modules.md)

# Kwenta SDK

Note: This document is a work in progress, as the implementation of the Kwenta SDK is still in progress. Interfaces, types and overall structure are subject to change.

# Architecture

The SDK is a collection of multiple classes, objects and functions which can generally be categorized as follows:

## Context

The context class (pending implementation) contains attributes that are used by other classes, especially services (see the section below), to determine what context they are being called in. For example, the context class contains information about the provider, signer, wallet address and network ID.

## Services

Services are collection of methods that function together to enable. We have services for futures, exchange, synths and transactions. A service's methods are available under `sdk.[service-name]`. While services function independently for the most part, they may also call methods on other services.

## Events

In certain situations where the SDK needs to inform a client about data changes (for example, exchange rate updates), we emit events that clients can listen to.

## Contracts

Based on the currently selected networkId, we maintain a list of available contracts in the context, used for subsequent contract calls. When there is an attempt to access a contract that is not available on the network, an error is thrown.

## Synths

Similarly to contracts, we maintain a list of synths on the current network, which is used for fetching balances, synth names etc.

# Testing

One of the main benefits of extracting Kwenta's logic into an SDK is the ability to test business logic independently of the UI. The `tests` folder will contain a number of unit and integration tests that will help us remain confident in the functionality of the SDK, as well as our ability to output sensible errors when one or more of our dependencies do not behave as expected. These tests will also be updated frequently as new features are added and bugs are fixed.
