import { notification } from 'antd'
import { NotificationPlacement } from 'antd/lib/notification'

import { getAppContainer } from 'helpers/element'

type NotificationType = {
  type: 'open' | 'success' | 'info' | 'warning' | 'error'
  message: string
  description?: React.ReactNode
  duration?: number
  placement?: NotificationPlacement
  btn?: React.ReactNode
}

export const Notification = ({
  type,
  message,
  description = '',
  duration = 10,
  placement = 'topRight',
  btn,
}: NotificationType) => {
  notification[type]({
    message,
    description,
    duration,
    btn,
    placement,
    getContainer: getAppContainer,
  })
}
