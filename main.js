// DEPENDENCIES

var {combineReducers, applyMiddleware, createStore} = Redux;
var {default: thunk} = ReduxThunk;





// ACTIONS
var THREAD_LOGS_LOADED  = 'threadLogsLoaded',
    THREAD_LOGS_LOADING = 'threadLogsLoading',
    THREAD_LOG_ADDED    = 'threadLogAdded',

    /**
     * Call this to set the state of 'loading', to add a spinner or something similar.
     *
     * @return {object}
     */
    loadingLogs = function () {
        console.log('running loadingLogs');

        return {
            type: THREAD_LOGS_LOADING,
            body: null,
            timestamp: null,
            fetching: true
        };
    },

    /**
     * Add multiple logs
     *
     * @param {array} logs
     * @return {object}
     */
    addThreadLogs = function (logs) {
        console.log('running addThreadLogs');

        return {
            type: THREAD_LOGS_LOADED,
            body: logs,
            timestamp: Date.now(),
            fetching: false
        };
    },

    /**
     * Add a single log
     *
     * @param {object} log
     * @return {object}
     */
    addThreadLog = function (log) {
        console.log('running addThreadLog');
        return {
            type: THREAD_LOG_ADDED,
            body: log,
            timestamp: Date.now(),
            fetching: false
        };
    },

    /**
     * Simulation of an API call to fetch logs from server. It will get them from localStorage.
     *
     * @return {Function} function takes dispatch as a param, to use with redux thunk.
     */
    fetchThreadLogsAsync = () => {
        console.log('running fetchLogsAsync');

        return (dispatch) => {
            dispatch(loadingLogs());

            return ES6Promise.Promise(function (resolve, reject) {
                var logs = localStorage.getLogs('logs');

                setTimeout(function (arguments) {
                    resolve(JSON.parse(logs));
                }, 1000);
            })
            .then((logs) => dispatch(addThreadLogs(logs)));
        };
    };



// REDUCERS
var thread = (state, action) => {
        if (!state) {
            state = {'logs': []};
        }

        switch (action.type) {
            case THREAD_LOGS_LOADED:
                console.log(state, action);
                // return {...state, ...action};
                return state;

            case THREAD_LOGS_LOADING:
                console.log(state, action);
                // return {...state, ...action};
                return state;

            case THREAD_LOG_ADDED:
                state.logs = state.logs.concat(action.body);
                console.log(state, action);
                return state;

            default:
                return state;
        }
    };

var reducers = combineReducers({'thread': thread});

var threadLogStore = createStore(
    reducers,
    applyMiddleware(thunk)
);



// WIDGET CODE

threadLogStore.subscribe(function () {
    var state        = threadLogStore.getState(),
        logs         = state.thread.logs,
        logListItems = [],
        fragment     = document.createDocumentFragment(),
        logList      = document.getElementById('logs');

    logList.innerHTML = '';

    //update the DOM
    logs.forEach(function (log) {
        var logListItem = document.createElement('li');

        logListItem.innerText = log.text;

        logListItems.push(logListItem);
    });

    logListItems.forEach(function (item) {
        fragment.appendChild(item);
    });

    logList.appendChild(fragment);
});

threadLogStore.subscribe(function () {
    var store = threadLogStore.getState(),
        lastLog = store.thread.logs[store.thread.logs.length - 1];

    if (lastLog.type === 'action') {
        alert('User ' + lastLog.text)
    }
});

document.getElementById('submit-draft')
    .addEventListener('click', function () {
        threadLogStore.dispatch(addThreadLog({
            'text': 'saved a draft',
            'type': 'action'
        }));
    });

document.getElementById('add-log')
    .addEventListener('click', function () {
        var newLog = document.getElementById('add-chat-thread-log').value,
            customEvent = new CustomEvent(THREAD_LOG_ADDED, {'detail': newLog});

        document.dispatchEvent(customEvent);
    });

document.addEventListener(THREAD_LOG_ADDED, function (e) {
    threadLogStore.dispatch(addThreadLog({
        'text': e.detail,
        'type': 'chat'
    }));
});
