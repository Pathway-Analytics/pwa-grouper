// import type { SessionType } from '@pwa-grouper/core/types/session';
// importing types here stops this file from working as a global types file...!

declare namespace App {
    interface Locals {
      session?: SessionType;
      mode?: string;
      token?: string | null; // for testing in local mode
      message?: string;
    }
  }
  