import {
    actionDisplayMessage
} from './../actions/MiddleWareAction';

const promiseReject = store => next => action => {
    if (action.error) {
        console.error('Error Occurred');
        console.error(action.payload);
        let date = new Date();
        let formattedTime = `${date.getHours()} : ${date.getMinutes()}`
        store.dispatch(actionDisplayMessage(
            `${action.payload.message}. Please check back in a bit`,
            formattedTime,
            'error'
        ));
    }

    return next(action);
}

export default promiseReject;