import { useContext } from "react";
import PropTypes from "prop-types";

import useOutsideClick from "../../hooks/useOutSideClick";
import ArchiveIcon from "../../assets/svg/archive-icon.svg";
import DeleteIcon from "../../assets/svg/Bin-red.svg";
import RenameIcon from "../../assets/svg/pencil-icon.svg";
import DotMenuIcon from "../../assets/svg/vertical-dot-menu.svg";
import BlackDotsMenu from "../../assets/svg/vertical-3-dots-black.svg";
import { ThemeContext } from "../../context/Theme/ThemeContext";
import { LIGHT } from "../../constant/const";

const SessionDotMenu = ({
  isDotMenuOpen,
  onArchive,
  onDelete,
  onRename,
  onMenuClick,
  setIsDotMenuOpen,
}) => {
  const { ref, shouldNotConsiderRef } = useOutsideClick({
    callback: () => {
      setIsDotMenuOpen(false);
    },
  });

  const { theme } = useContext(ThemeContext);
  const isWhite = theme?.theme === LIGHT;

  const MENU_OPTIONS = [
    {
      label: "Rename",
      onClick: () => {
        setIsDotMenuOpen(false);
        onRename?.();
      },
      icon: RenameIcon,
    },
    {
      label: "Archive",
      onClick: () => {
        setIsDotMenuOpen(false);
        onArchive();
      },
      icon: ArchiveIcon,
    },
    {
      label: "Delete",
      onClick: () => {
        setIsDotMenuOpen(false);
        onDelete?.();
      },
      icon: DeleteIcon,
      className: "text-red-500",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={onMenuClick}
        ref={shouldNotConsiderRef}
        className="p-1 flex justify-center items-center"
      >
        <img
          src={isWhite ? BlackDotsMenu : DotMenuIcon}
          alt="Dot-menu-icon"
          className="max-w-[20px]"
        />
      </button>
      {isDotMenuOpen && (
        <div
          ref={ref}
          className="absolute bottom-[-110px] z-30 right-[0px] bg-black p-2 min-w-[100px] rounded-lg flex flex-col gap-3 justify-center items-center"
        >
          {MENU_OPTIONS?.map((item) => {
            return (
              <button
                key={item?.label}
                onClick={item?.onClick}
                className="flex gap-2 justify-around items-center w-full"
              >
                {item?.icon && (
                  <img
                    src={item?.icon}
                    alt="option-icon"
                    className="w-[16px] h-[15px]"
                  />
                )}
                <p
                  className={`${
                    item?.className || "text-white"
                  } text-[12px] md:text-[14px] font-normal`}
                >
                  {item?.label}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

SessionDotMenu.propTypes = {
  isDotMenuOpen: PropTypes.bool,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  onMenuClick: PropTypes.func,
  setIsDotMenuOpen: PropTypes.func,
};

export default SessionDotMenu;
