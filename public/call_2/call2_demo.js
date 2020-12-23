var STRINGEE_SERVER_ADDRS;
var stringeeClient;
var getTokenUrl;

var call;




STRINGEE_SERVER_ADDRS = ['wss://v1.stringee.com:6899/', 'wss://v2.stringee.com:6899/'];
getTokenUrl = '../php/token_pro.php';


function switchCamera(){
    call.switchCamera();
}

function testLogin() {
    stringeeClient = new StringeeClient(STRINGEE_SERVER_ADDRS);
    settingsClientEvents(stringeeClient);
    getAccessTokenAndConnectToStringee(stringeeClient);
}

function settingsClientEvents(client) {
    client.on('authen', function (res) {
        console.log('on authen: ', res);
        if (res.r === 0) {
            $('#loggedUserId').html(res.userId);
            $('#loggedUserId').css('color', 'blue');
            $('#loginBtn').attr('disabled', 'disabled');

            $('#call2Btn').removeAttr('disabled');
            $('#call2HangupBtn').removeAttr('disabled');
            $('#muteBtn').removeAttr('disabled');
            $('#enableVideoBtn').removeAttr('disabled');
        }
    });
    client.on('connect', function () {
        console.log('++++++++++++++ connected');
    });
    client.on('disconnect', function () {
        console.log('++++++++++++++ disconnected');
    });
    client.on('requestnewtoken', function () {
        console.log('++++++++++++++ requestnewtoken+++++++++');
    });
    client.on('incomingcall2', function (call2) {
        call = call2;
        settingCallEvent(call);

        $('#incomingcallBox').show();
        $('#incomingCallFrom').html(call2.fromNumber);
    });
}

function getAccessTokenAndConnectToStringee(client) {
    var userId = $('#userIdToAuthen').val();

    let urlGetToken = getTokenUrl + "?userId=" + userId;
    $.getJSON(urlGetToken, function (res) {
        var access_token = res.access_token;
        client.connect(access_token);
    });
}

function testCall2() {
    var fromNumber = '0909982668';
    var toNumber = $('#toNumberBtn').val();

    call = new StringeeCall2(stringeeClient, fromNumber, toNumber, true);

    var videoDimensionsHtml = $('#videoDimensions').val();
    console.log('videoDimensionsHtml', videoDimensionsHtml);
    if (videoDimensionsHtml == '720p') {
        call.videoResolution = {width: 1280, height: 720};
    } else if (videoDimensionsHtml == '480p') {
        call.videoResolution = {width: 854, height: 480};
    } else if (videoDimensionsHtml == '360p') {
        call.videoResolution = {width: 640, height: 360};
    } else if (videoDimensionsHtml == '240p') {
        call.videoResolution = {width: 426, height: 426};
    }

    settingCallEvent(call);
    call.makeCall(function (res) {
        if (res.r == 0) {
            console.log('make call success');
            setCallStatus('Calling...');
        }
    });
}

function settingCallEvent(call1) {
    call1.on('addlocalstream', function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
//        console.log('addlocalstream');
        localVideo.srcObject = null;
        localVideo.srcObject = stream;
    });
    call1.on('addremotestream', function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
//        console.log('addremoonstop()testream');
        remoteVideo.srcObject = null;
        remoteVideo.srcObject = stream;
    });
    call1.on('signalingstate', function (state) {
        console.log('signalingstate ', state);
        if (state.code === 6) {
            $('#incomingcallBox').hide();
        }

        if (state.code === 6) {
            setCallStatus('Ended');
            onstop();
        } else if (state.code === 3) {
            setCallStatus('Answered');
        } else if (state.code === 5) {
            setCallStatus('User busy');
            onstop();
        }
    });
    call1.on('mediastate', function (state) {
        console.log('mediastate ', state);
    });
    call1.on('otherdevice', function (msg) {
        console.log('otherdevice ', msg);
        if (msg.type == 'CALL2_STATE') {
            if (msg.code == 200 || msg.code == 486) {
                $('#incomingcallBox').hide();
            }
        }
    });
}

function testAnswer() {
    call.answer(function (res) {
        console.log('answer res', res);
        if (res.r === 0) {
            setCallStatus('Answered');
        }
    });
    $('#incomingcallBox').hide();
}

function testReject() {
    console.log('testReject');
    call.reject(function (res) {
        console.log('reject res', res);
    });
    $('#incomingcallBox').hide();
}

function testHangup() {
    call.hangup(function (res) {
        console.log('hangup res', res);
    });
    onstop();
}

function onstop() {
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

function setCallStatus(status) {
    $('#txtStatus').html(status);
}

function testMute() {
    if (call.muted) {
        call.mute(false);
        console.log('unmuted');
    } else {
        call.mute(true);
        console.log('muted');
    }
}

function testDisableVideo() {
    if (call.localVideoEnabled) {
        call.enableLocalVideo(false);
        console.log('disable Local Video');
    } else {
        call.enableLocalVideo(true);
        console.log('enable Local Video');
    }
}