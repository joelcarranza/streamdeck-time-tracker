# streamdeck-time-tracker

A StreamDeck plugin for tracking time with Todoist. Provides an action that displays the current running timer and a separate action that starts a timer with specificly configured options. 

This provides an alternative to [blueshiftone/streamdeck-toggl)](https://github.com/blueshiftone/streamdeck-toggl), which only displays running time if the currently running timer matches the timer options it is configured with.

**In development**

## Building

You will node/npm installed as well as [just](https://github.com/casey/just). Then you can setup the [Elgato CLI](https://www.npmjs.com/package/@elgato/cli) with

    just setup

and then to install locally:

    just link

to build a package:

    just build
