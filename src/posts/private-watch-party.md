---
id: private-watch-party
title: I built my own screen-sharing setup for the World Cup
date: 2026-07-21
excerpt: A small self-hosted watch-party setup built after Discord's screen-share limits got in the way.
tags:
  - WebRTC
  - Self-hosted
  - Tailscale
  - Side Projects
---

During the 2026 World Cup, a few friends and I wanted to watch matches together. The only problem was that we were all in different countries.

The obvious answer was Discord. Someone shares their screen, everyone else joins the call, and that is usually good enough.

But the Discord plan we were using limited screen sharing to 720p at 30fps. It worked, but it was not a particularly nice way to watch football. Fast camera movement and a lot of detail do not survive low-bitrate screen sharing very gracefully.

So I built a small alternative for us: [private-watch-party](https://github.com/Dhaiwat10/private-watch-party).

This was not an attempt to build the next Twitch, or even a serious Discord replacement. I just wanted a reliable way to capture one screen at home, send it to a few friends, and let them watch in a browser at a quality that made sense for their connection.

That was the entire brief.

## The Constraints

The project had a few important constraints from the beginning.

First, it needed to be simple. I did not want anybody to install a special desktop app or fight with a media player. A browser link is a very good interface for a watch party.

Second, it was for a small, trusted group. That meant I could optimise for a handful of friends instead of trying to solve account management, billing, moderation, or global delivery.

Third, I did not want to expose a home machine directly to the public internet. This is a hobby project running around a real screen and a real network. Keeping the access scope small mattered more than making it discoverable.

Finally, I wanted control over the capture and encoding settings. The important part was not chasing a particular resolution or latency number. It was being able to choose a reasonable tradeoff for the match, the host machine, and the connections of the people watching.

## The Setup

The architecture is deliberately tiny:

```text
OBS -> WHIP -> MediaMTX -> WHEP -> browser viewer
                 |
             Tailscale
```

[OBS](https://obsproject.com/) captures the screen and encodes the video. Instead of sending that video to a public streaming platform, OBS publishes it to [MediaMTX](https://github.com/bluenviron/mediamtx), a small media server running on the host machine.

The ingest side uses WHIP, which is a WebRTC protocol for publishing media. On the other side, MediaMTX exposes a WHEP endpoint, which lets a browser receive the stream using WebRTC too.

The viewer is just a small HTML page. It connects to the WHEP endpoint and plays the incoming stream in a video element. There is no account, no chat, no recommendation algorithm, and no giant application layer sitting in the middle.

This is exactly what I wanted.

The remaining piece is [Tailscale](https://tailscale.com/). Every person in the watch party joins the same private network, so the viewer and the media server can talk without opening the setup to the entire internet. Tailscale handles the boring but important part: private connectivity between devices that are not on the same Wi-Fi network.

## Why WebRTC?

There are plenty of ways to move video around. I could have used a more traditional streaming protocol and accepted a larger delay. I could have uploaded to a hosted service. I could have tried to build something on top of a video-call API.

WebRTC made sense because the browser already knows how to play it and because it is designed for interactive media. WHIP and WHEP also kept the two halves of the system clear: OBS publishes, MediaMTX relays, and the browser watches.

I like setups where every component has one job.

OBS is good at screen capture and encoding. MediaMTX is good at receiving and distributing streams. The browser is good at being a browser. Tailscale is good at private networking.

I did not need to write any streaming logic myself. I only needed to put these pieces together in a way that fit the problem.

## The Real Tradeoff: Bandwidth

There is no free lunch here. Better-looking video needs more bandwidth, and a home internet connection is not a CDN.

The host has to upload the stream once for each viewer. If the stream is using 8 Mbps and three friends are watching, the host may need roughly 24 Mbps of sustained upload capacity, plus some room for overhead and network variation. The viewer also needs enough download bandwidth to keep up.

That is perfectly reasonable for a small group, but it is not a setup I would use to broadcast to hundreds of people. A larger audience needs a different architecture: adaptive bitrate ladders, edge distribution, monitoring, and a much less relaxed attitude towards failure modes.

For our use case, the constraint was actually helpful. We could pick settings that worked for the group instead of pretending there was one universally correct quality level.

## What Worked

The nicest part of this project is how little is required on the viewer side. Once someone is on the tailnet, they open a link and the stream starts in the browser.

OBS gave me the knobs I wanted without forcing me to write an encoder. MediaMTX let me keep the server side small. The custom viewer page was intentionally boring, which is a compliment here: it has one job and does it.

It was also satisfying to see that the whole setup was understandable. If something went wrong, there were only a few places to look: the capture in OBS, the publish connection, the media server, the private network, or the viewer page.

That is a much nicer debugging experience than a system made out of ten opaque services.

## What I Did Not Build

This is not a polished product, and that is intentional.

There are no public accounts, stream replays, adaptive bitrate profiles, or scaling guarantees. It is a personal-use project for small trusted groups. If I needed to support strangers or a large audience, I would start with a different set of requirements rather than bolt features onto this one.

I did make one security decision that is worth calling out. The browser viewer is served from its own static directory, not from the repository root. That way, a viewer cannot accidentally request server configuration files or Git metadata from the same web server. Small projects deserve that kind of boundary too.

## The Point of Building It

I could probably have tolerated the Discord stream and moved on. But this was a real problem shared by real friends, and the solution was small enough to build in an evening or two.

That is my favourite kind of side project: not a startup idea, not a portfolio toy, but a tool with a very specific reason to exist.

For a few World Cup matches, it gave our group a better way to be in the same room while being very far away from one another. That was enough.
