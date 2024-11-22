# streamdeck-time-tracker

![StreamDeck Time Tracker](https://raw.githubusercontent.com/joelcarranza/streamdeck-time-tracker/refs/heads/main/docs/screenshot-actions.png)

A StreamDeck plugin for tracking time with Todoist. Provides an action that displays the current running timer and a separate action that starts a timer with specifically configured options. 

![Screenshot of Time Tracker Action](https://raw.githubusercontent.com/joelcarranza/streamdeck-time-tracker/refs/heads/main/docs/screenshot-tracker.png)

![Screenshot of Start Timer Action](https://raw.githubusercontent.com/joelcarranza/streamdeck-time-tracker/refs/heads/main/docs/screenshot-start-timer.png)

This provides an alternative to [blueshiftone/streamdeck-toggl](https://github.com/blueshiftone/streamdeck-toggl), which only displays running time if the currently running timer matches the timer options it is configured with.

**In development**

## Building

You will node/npm installed as well as [just](https://github.com/casey/just). Then you can setup the [Elgato CLI](https://www.npmjs.com/package/@elgato/cli) with

    just setup

and then to install locally:

    just link

to build a package:

    just build
