import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAsyncFunction } from "@utils/common/isType";

/* README:

const {data, isLoading, isFetching, error, mutate, reset} = useGlobalState(key, options);

- key: KEY for identity global state
- options: {
    initialData: initData for state
    notifyOnChangeProps: for re-rerending purpose base on listening each of value change "data", "error", "isLoading", "isFetching"
    select: like selector redux
}

- data, isLoading, isFetching, error: like userQuery
- mutate: (value | function | async function) => newData
mutate receive a parameter as value || function: (oldData => new Data) || async function (oldData => newData)
it will update state.

Example:

const useTheme = (select) => {
    const {data, mutate} = useGlobalState(["theme"], {
        initialData: {
            mode: "light",
            color: {...}
        },
        notifyOnChangeProps: ["data"],
        select
    })

    const changeMode = (newMode) => {
        mutate({
            mode: newMode,
            color: data.color
        })

        // OR mutate((oldData) => {
            return {
                ...oldData, mode: newMode
            }
        })

        // OR mutate(async (oldData) => {
            sometime delay;
            return {
                ...oldData, mode: newMode
            }
        }) when using async function, isFetching will be change.
    }
}

-----------------------

const {data: mode} = useTheme((state) => state.mode);

*/

export interface IGlobalStateOptions<TState> {
    initialData: TState;
    notifyOnChangeProps?: Array<"data" | "error" | "isLoading" | "isFetching">;
    select?: (state: TState) => any;
}

const initGlobalStateOptions: IGlobalStateOptions<any> = {
    initialData: null,
    notifyOnChangeProps: ["data"]
};

export const useGlobalState = <TState>(keys: any[], options: IGlobalStateOptions<TState>) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isFetching, error } = useQuery<TState, unknown, TState>({
        queryKey: keys,
        queryFn: async () => options.initialData,
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
        ...initGlobalStateOptions,
        ...options
    });

    const mutate = async <T extends TState>(param: any) => {
        if (isAsyncFunction(param)) {
            const currentData = queryClient.getQueryData(keys);
            const data = queryClient.fetchQuery({
                queryKey: keys,
                queryFn: async () => {
                    return await param(currentData);
                }
            });

            return data as T;
        } else {
            const data = queryClient.setQueryData(keys, param);
            return data as T;
        }
    };

    const reset = () => {
        queryClient.setQueryData(keys, options.initialData);
    };

    return {
        data,
        isLoading,
        isFetching,
        error,
        mutate,
        reset
    };
};
