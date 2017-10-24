#!/bin/bash
cp configs/GCPadNew.ini $HOME/Library/Application\ Support/Dolphin/Config/
mkfifo $HOME/Library/Application\ Support/Dolphin/Pipes/ctrl1
mkfifo $HOME/Library/Application\ Support/Dolphin/Pipes/ctrl2
mkfifo $HOME/Library/Application\ Support/Dolphin/Pipes/ctrl3
mkfifo $HOME/Library/Application\ Support/Dolphin/Pipes/ctrl4
