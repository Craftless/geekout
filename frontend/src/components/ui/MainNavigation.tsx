import { useEffect, useState } from "react";
import { IoIosMenu } from "react-icons/io";
import { ModeToggle } from "../ui/ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Backdrop from "./Backdrop";
import MainHeader from "./MainHeader";
import styles from "./MainNavigation.module.css";
import NavLinks from "./NavLinks";
import NavLinksList from "./NavLinksList";
import SideNavLinks from "./SideNavLinks";

const MainNavigation = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  function closeDrawer() {
    setDrawerIsOpen(false);
  }
  function openDrawer() {
    setDrawerIsOpen(true);
  }

  useEffect(() => {
    window.addEventListener("resize", closeDrawer);
    return window.removeEventListener("resize", closeDrawer);
  }, []);

  return (
    <>
      {drawerIsOpen && <Backdrop onClick={closeDrawer} />}
      <MainHeader>
        <Sheet open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <div>
              <IoIosMenu size={36} />
            </div>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-1 py-6">
              <SideNavLinks>
                <NavLinksList setOpen={setDrawerIsOpen} />
              </SideNavLinks>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center flex-1 justify-between">
          <h1 className="pl-4 font-semibold">Your Quizzes</h1>
          <div className="flex flex-row">
            <ModeToggle />
            <nav className={styles["header-nav"]}>
              <NavLinks />
            </nav>
          </div>
        </div>
      </MainHeader>
    </>
  );
};

export default MainNavigation;
