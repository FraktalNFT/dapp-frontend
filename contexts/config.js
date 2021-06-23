const config = {
  ipfs: {
    // preload: {
    //   enabled: false
    // },
    repo: "fraktal",
    relay: { enabled: true, hop: { enabled: true, active: true } },
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          // "/ip4/127.0.0.1/tcp/4001",
          // "/ip6/::/etcp/4001",
          // "/ip4/127.0.0.1/tcp/4002/ws",
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
          '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
          // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        ]
      }
    }
  }
}

export default config
