import {
  Add as IxAdd,
  Android as IxAndroid,
  ArrowLeft as IxArrowLeft,
  ArrowRight as IxArrowRight,
  ArrowSwapHorizontal as IxArrowSwapHorizontal,
  Back as IxBack,
  Call as IxCall,
  CallSlash as IxCallSlash,
  CloseCircle as IxCloseCircle,
  Code as IxCode,
  Copy as IxCopy,
  DocumentCode as IxDocumentCode,
  Flash as IxFlash,
  HambergerMenu as IxHambergerMenu,
  Hierarchy as IxHierarchy,
  InfoCircle as IxInfoCircle,
  Moon as IxMoon,
  NotificationBing as IxNotificationBing,
  Personalcard as IxPersonalcard,
  RotateLeft as IxRotateLeft,
  Send as IxSend,
  Send2 as IxSend2,
  Setting4 as IxSetting4,
  ShieldTick as IxShieldTick,
  Sms as IxSms,
  Sun1 as IxSun1,
  TickCircle as IxTickCircle,
} from "iconsax-react";

/*
 * Every icon on the site, from Iconsax (iconsax-react). They default to 1em and the
 * current text colour, so CSS sizes and colours them like text. Use variant="Bold" for filled.
 * Iconsax has no brand logos, so GitHub, LinkedIn and X are drawn here.
 */
const make = (C, name) => {
  const I = (p) => <C size="1em" color="currentColor" {...p} />;
  I.displayName = name;
  return I;
};

export const Add = make(IxAdd, "Add");
export const Android = make(IxAndroid, "Android");
export const ArrowLeft = make(IxArrowLeft, "ArrowLeft");
export const ArrowRight = make(IxArrowRight, "ArrowRight");
export const ArrowSwapHorizontal = make(IxArrowSwapHorizontal, "ArrowSwapHorizontal");
export const Back = make(IxBack, "Back");
export const Call = make(IxCall, "Call");
export const CallSlash = make(IxCallSlash, "CallSlash");
export const CloseCircle = make(IxCloseCircle, "CloseCircle");
export const Code = make(IxCode, "Code");
export const Copy = make(IxCopy, "Copy");
export const DocumentCode = make(IxDocumentCode, "DocumentCode");
export const Flash = make(IxFlash, "Flash");
export const HambergerMenu = make(IxHambergerMenu, "HambergerMenu");
export const Hierarchy = make(IxHierarchy, "Hierarchy");
export const InfoCircle = make(IxInfoCircle, "InfoCircle");
export const Moon = make(IxMoon, "Moon");
export const NotificationBing = make(IxNotificationBing, "NotificationBing");
export const Personalcard = make(IxPersonalcard, "Personalcard");
export const RotateLeft = make(IxRotateLeft, "RotateLeft");
export const Send = make(IxSend, "Send");
export const Send2 = make(IxSend2, "Send2");
export const Setting4 = make(IxSetting4, "Setting4");
export const ShieldTick = make(IxShieldTick, "ShieldTick");
export const Sms = make(IxSms, "Sms");
export const Sun1 = make(IxSun1, "Sun1");
export const TickCircle = make(IxTickCircle, "TickCircle");

const brand = (path, name) => {
  const I = ({ variant, ...p }) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...p}><path d={path} /></svg>
  );
  I.displayName = name;
  return I;
};
export const GithubLogo = brand("M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z", "GithubLogo");
export const LinkedinLogo = brand("M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z", "LinkedinLogo");
export const XLogo = brand("M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z", "XLogo");
