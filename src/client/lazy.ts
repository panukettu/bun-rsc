import { useContext } from "react";
import { RouterContext } from "./Router";

export const useRouter = () => {
	return useContext(RouterContext);
};
