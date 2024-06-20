const MainHeader = (props: any) => {
  return (
    <header className="w-full h-16 flex items-center bg-background fixed top-0 left-0 shadow-sm px-4 z-50 border-b-2 border-b-border">
      {props.children}
    </header>
  );
};

export default MainHeader;
