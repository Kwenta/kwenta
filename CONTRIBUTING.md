# Contributors Guide

Kwenta is a dApp enabling derivatives trading with infinite liquidity - powered by the Synthetix protocol. We're community driven and welcome all contributions. We aim to provide a constructive, respectful and fun environment for collaboration.

If you wish to help out, please first join the **Kwenta devDAO** on our [Discord](https://discord.gg/kwentaio) `#devdao-chat` channel. For more information, see [devDAO](#devdao) below.

This guide is geared towards beginners. If you're an open-source veteran feel free to just skim this document and get straight into crushing issues.

## Why Contribute

There are many reasons you might contribute to Kwenta. For example, you may wish to:

- contribute to the Ethereum ecosystem.
- establish yourself as an Ethereum developer.
- work on cutting-edge technology.
- learn how to participate in open-source projects.
- expand your software development skills.
- flex your skills in a public forum to expand your career
  opportunities (or simply for the fun of it).
- grow your network by working with fellow Ethereum developers.

## How to Contribute

Regardless of the reason, the process to begin contributing is very much the same. We operate like a typical open-source project operating on GitHub: the repository [Issues](https://github.com/kwenta/kwenta/issues) is where we track what needs to be done and [Pull Requests](https://github.com/kwenta/kwenta/pulls) is where code gets reviewed. We use [Discord](https://discord.gg/kwentaio) to chat and distribute tickets to community members.

## <a id="devdao"></a>devDAO

The devDAO has been created specifically to foster open community development and reward community developers. It is an essential piece in our collaborative effort to fully decentralize Kwenta.

Be welcome to join the Kwenta devDAO on our [Discord](https://discord.gg/kwentaio) `#devdao-chat` channel.

This is where discussions take place, new tickets will be announced by the community PM and assigned to the respective community members and roles on a first come, first served base.

There are different roles depending on the severity of a ticket. As a new community member, you should watch out for *bounty hunter* tickets are work your way up from there.

### General Work-Flow

We recommend the following work-flow for contributors:

1. **Find an open ticket** to work on in our Discord, either because it's interesting or suitable to your skill set. Use the `#devdao-chat channel` to communicate your intentions and ask questions.
2. **Work in a feature branch** of your personal fork (github.com/YOUR_NAME/kwenta) of the main repository (github.com/kwenta/kwenta).
3. Once you feel you have addressed the issue, **create a pull-request** to merge your changes into the main repository. In case of any doubts, don't hesitate to contact the community PM or ask away in the channel.
4. Wait for a CC or auditor to **review your changes** to ensure the issue is addressed satisfactorily. Optionally, mention your PR on [Discord](https://discord.gg/kwentaio).
5. If the issue is addressed the repository maintainers will **merge your pull-request** and you'll be an official contributor!

### First-time Set-up

First time contributors can get their git environment up and running with these steps:

1. [Create a fork](https://help.github.com/articles/fork-a-repo/#fork-an-example-repository) and [clone it](https://help.github.com/articles/fork-a-repo/#step-2-create-a-local-clone-of-your-fork) to your local machine.
2. [Add an *"upstream"* branch](https://help.github.com/articles/fork-a-repo/#step-3-configure-git-to-sync-your-fork-with-the-original-spoon-knife-repository) that tracks the Kwenta repository using `$ git remote add upstream
https://github.com/kwenta/kwenta.git` (pro-tip: [use SSH](https://help.github.com/articles/connecting-to-github-with-ssh/) instead of HTTPS).
3. Create a new feature branch with `$ git checkout -b your_feature_name`. The name of your branch isn't critical but it should be short and instructive. E.g., if you're fixing a bug with serialization, you could name your branch `fix/serialization_bug`.
4. Make sure you sign your commits. See the [relevant doc](https://help.github.com/en/github/authenticating-to-github/about-commit-signature-verification).
5. Commit your changes and push them to your fork with `$ git push origin your_feature_name`.
6. Go to your fork on github.com and use the web interface to create a pull request into the Kwenta repository.

From there, the CCs or auditors will review the PR and either accept it or provide some constructive feedback.

If you have any questions along the way, the community PM will be there to guide and assist you!

There's a great [guide](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/) by Rob Allen that provides much more detail on each of these steps, if you're having trouble. As always, jump on [Discord](https://discord.gg/kwentaio) if you get stuck.

## FAQs

### I don't think I have anything to add

There's lots to be done and there's all sorts of tasks. You can do anything from correcting typos to writing core dApp code. If you reach out, we'll include you.

### I'm not sure my programming level is good enough

We're open to developers of all levels. If you create a PR and your code doesn't meet our standards, we'll help you fix it and we'll share the reasoning with you. Contributing to open-source is a great way to learn.

### I'm not sure I know enough about Ethereum

No problems, there's plenty of tasks that don't require extensive Ethereum knowledge. You can learn about Ethereum as you go.

### I'm afraid of making a mistake and looking silly

Don't be. We're all about personal development and constructive feedback. If you make a mistake and learn from it, everyone wins.

### I don't like the way you do things

Please, make an issue and explain why. We're open to constructive criticism and will happily change our ways.
