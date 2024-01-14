declare namespace App {
    interface Locals {
      sessionServerFetch?: SessionType;
      serverSession?: SessionType;
      session?: SessionType;
      token?: string;  // used in localhost dev mode only
    }
  }
  