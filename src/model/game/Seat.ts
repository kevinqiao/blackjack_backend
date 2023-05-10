import { SeatBetSlot } from "./SeatBetSlot";

export declare type SeatModel = {
  no: number;
  uid: string | null;
  currentSlot: number;
  slots: SeatBetSlot[];
  acted: number[];
  bet: number;
  insurance: number;
  status: number;
};
