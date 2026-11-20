import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon, Bug01Icon, GitMergeIcon, GitPullRequestIcon, Idea01Icon, StarIcon, BatteryFullIcon, SignalFull02Icon, Wifi01Icon, ArrowLeft01Icon, Attachment01Icon, Bookmark01Icon, Mic01Icon, MoreVerticalIcon, Search01Icon, SmileIcon, DashboardSquare01Icon, HelpCircleIcon, Home01Icon, WorkflowSquare03Icon, ArrowLeft02Icon, ArrowRight02Icon, ArrowTurnBackwardIcon, BotIcon, Call02Icon, CallEnd01Icon,
  Cancel01Icon, CheckmarkCircle02Icon, Copy01Icon, FileScriptIcon, FlashIcon, GitForkIcon, GithubIcon, IdIcon,
  InformationCircleIcon, Linkedin01Icon, Mail01Icon, Menu01Icon, Moon02Icon, NewTwitterIcon, Notification03Icon,
  RotateLeft01Icon, SecurityCheckIcon, SentIcon, SlidersHorizontalIcon, SourceCodeIcon, Sun03Icon, SwipeLeft01Icon,
  TelegramIcon, Tick02Icon,
} from "@hugeicons/core-free-icons";

/*
 * Every icon on the site, from Hugeicons (free stroke-rounded set). They default to 1em and the
 * current text colour, so CSS sizes and colours them like text. variant="Bold" draws a heavier stroke.
 */
const make = (icon, name) => {
  const I = ({ variant, strokeWidth, ...p }) => (
    <HugeiconsIcon icon={icon} size="1em" color="currentColor" strokeWidth={strokeWidth ?? (variant === "Bold" ? 2.2 : 1.8)} aria-hidden="true" {...p} />
  );
  I.displayName = name;
  return I;
};

export const ArrowLeft = make(ArrowLeft02Icon, "ArrowLeft");
export const Attach = make(Attachment01Icon, "Attach");
export const Bug = make(Bug01Icon, "Bug");
export const Idea = make(Idea01Icon, "Idea");
export const Merge = make(GitMergeIcon, "Merge");
export const PullRequest = make(GitPullRequestIcon, "PullRequest");
export const Star = make(StarIcon, "Star");
export const Battery = make(BatteryFullIcon, "Battery");
export const Signal = make(SignalFull02Icon, "Signal");
export const Wifi = make(Wifi01Icon, "Wifi");
export const BackArrow = make(ArrowLeft01Icon, "BackArrow");
export const Bookmark = make(Bookmark01Icon, "Bookmark");
export const Mic = make(Mic01Icon, "Mic");
export const More = make(MoreVerticalIcon, "More");
export const Search = make(Search01Icon, "Search");
export const Smile = make(SmileIcon, "Smile");
export const Features = make(DashboardSquare01Icon, "Features");
export const Help = make(HelpCircleIcon, "Help");
export const Home = make(Home01Icon, "Home");
export const Workflow = make(WorkflowSquare03Icon, "Workflow");
export const ArrowRight = make(ArrowRight02Icon, "ArrowRight");
export const Bell = make(Notification03Icon, "Bell");
export const Bot = make(BotIcon, "Bot");
export const Call = make(Call02Icon, "Call");
export const CallEnd = make(CallEnd01Icon, "CallEnd");
export const CheckCircle = make(CheckmarkCircle02Icon, "CheckCircle");
export const Close = make(Cancel01Icon, "Close");
export const Copy = make(Copy01Icon, "Copy");
export const FileScript = make(FileScriptIcon, "FileScript");
export const Flash = make(FlashIcon, "Flash");
export const GitFork = make(GitForkIcon, "GitFork");
export const Github = make(GithubIcon, "Github");
export const IdCard = make(IdIcon, "IdCard");
export const Info = make(InformationCircleIcon, "Info");
export const Linkedin = make(Linkedin01Icon, "Linkedin");
export const Mail = make(Mail01Icon, "Mail");
export const Menu = make(Menu01Icon, "Menu");
export const Moon = make(Moon02Icon, "Moon");
export const Plus = make(Add01Icon, "Plus");
export const Reply = make(ArrowTurnBackwardIcon, "Reply");
export const RotateLeft = make(RotateLeft01Icon, "RotateLeft");
export const Send = make(SentIcon, "Send");
export const ShieldCheck = make(SecurityCheckIcon, "ShieldCheck");
export const Sliders = make(SlidersHorizontalIcon, "Sliders");
export const SourceCode = make(SourceCodeIcon, "SourceCode");
export const Sun = make(Sun03Icon, "Sun");
export const Swipe = make(SwipeLeft01Icon, "Swipe");
export const Telegram = make(TelegramIcon, "Telegram");
export const Tick = make(Tick02Icon, "Tick");
export const XLogo = make(NewTwitterIcon, "XLogo");
