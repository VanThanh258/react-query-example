import { useFetcher } from "infrastructure/hooks/useFetcher";
import {
    IDataUpdateDeviceTokenAndConfigNotification,
    TResGetConfigNotification,
    TResNotification,
    TResUpdateDeviceTokenAndConfigNotification,
    TResUpdateHaveSeenNotification
} from "../model/noti";
import { QUERY_KEY, QUERY_KEY_GLOBALSTATE } from "infrastructure/constant/query_key";
import { NotificationApi } from "../api/noti";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IGlobalStateOptions, useGlobalState } from "@utils/hooks/useGlobalState";

interface IFetchMoreNotification {
    page: string;
    onSuccess: (data: TResNotification) => void;
    onError: (e: any) => void;
}

interface IDataUpdateHaveSeenNotiMutation {
    list_noti_id: string[];
    onSuccess: (data: TResUpdateHaveSeenNotification) => void;
    onError: (e: any) => void;
}

interface IDataUpdateDeviceTokenAndConfigNotificationMutation {
    data: IDataUpdateDeviceTokenAndConfigNotification;
    onSuccess: (data: TResUpdateDeviceTokenAndConfigNotification) => void;
    onError: (e: any) => void;
}

export class NotificationService {
    static useNotification = (enabled: boolean) => {
        const queryClient = useQueryClient();
        const { data } = useFetcher<TResNotification>([QUERY_KEY.NOTIFICATION], () => NotificationApi.get_list_noti(), {
            enabled: enabled
        });

        const { mutate: mutateGet, isLoading: isLoadingfetchMore } = useMutation({
            mutationFn: (page: string) => NotificationApi.get_list_noti(page)
        });

        const fetchMoreNotificationMutation = ({ page, onSuccess, onError }: IFetchMoreNotification) => {
            mutateGet(page, {
                onSuccess: onSuccess,
                onError: onError
            });
        };

        const { mutate: mutateUpdate } = useMutation({
            mutationFn: (list_noti_id: string[]) => NotificationApi.update_have_seen_noti(list_noti_id),
            onMutate: (list_noti_id: string[]) => {
                const prev: TResNotification | undefined = queryClient.getQueryData([QUERY_KEY.NOTIFICATION]);
                if (prev) {
                    const newObj = Object.assign({}, prev);
                    const array = newObj.data;
                    for (const noti_id of list_noti_id) {
                        const index = array.findIndex((item) => item._id === noti_id);
                        if (index > -1) {
                            array[index].haveSeen = true;
                        }
                    }
                    queryClient.setQueryData([QUERY_KEY.NOTIFICATION], newObj);
                }
                return { prev };
            },
            onError: (error, newData, context) => {
                queryClient.setQueryData([QUERY_KEY.NOTIFICATION], context?.prev);
            }
        });

        const updateHaveSeenNotiMutation = ({ list_noti_id, onSuccess, onError }: IDataUpdateHaveSeenNotiMutation) => {
            mutateUpdate(list_noti_id, {
                onSuccess,
                onError
            });
        };

        return { data, fetchMoreNotificationMutation, isLoadingfetchMore, updateHaveSeenNotiMutation };
    };

    static useConfigNotification = ({ enabled }: { enabled: boolean }) => {
        const { data } = useFetcher<TResGetConfigNotification>(
            [QUERY_KEY.CONFIG_NOTIFICATION],
            () => NotificationApi.get_config_notification(),
            {
                enabled
            }
        );

        const { mutate: mutateUpdate } = useMutation({
            mutationFn: (data: IDataUpdateDeviceTokenAndConfigNotification) =>
                NotificationApi.update_device_token_and_config_notification(data)
        });

        const updateDeviceTokenAndConfigNotificationMutation = ({
            data,
            onSuccess,
            onError
        }: IDataUpdateDeviceTokenAndConfigNotificationMutation) => {
            mutateUpdate(data, {
                onSuccess,
                onError
            });
        };

        return { data, updateDeviceTokenAndConfigNotificationMutation };
    };
}

export const useVisibleModalTurnOnNotification = (notifyOnChangeProps = ["data"] as any) => {
    const { data, mutate } = useGlobalState<{
        isVisible: boolean;
    }>([QUERY_KEY_GLOBALSTATE.VISIBLE_NOTIFICATION], {
        initialData: {
            isVisible: false
        },
        notifyOnChangeProps: notifyOnChangeProps
    });

    const updateVisible = (isVisible: boolean) => {
        mutate({
            isVisible
        });
    };

    return { data, updateVisible };
};
