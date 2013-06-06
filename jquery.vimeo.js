/**
 * Author : Kobby Appiah
 * Analog Interactive, Inc.
 * Date: 5/30/13
 *
 * A simple jquery plugin to simplify the use of the
 * Vimeo Javascript Api
 */


(function(win, $){

    $.fn.Vimeo = function(opts, value){

        // just to be blunt
        if(!win.jQuery){
            console.log('This plugin requires jquery to be loaded before it can run.');
            return;
        }

        var domEl = this[0];
        var url = this.attr('src').split('?')[0];
        var options = {};
        var self = this;

        var vimeoEvents = ['play', 'pause', 'ready', 'seek', 'finish', 'loadProgress', 'playProgress'];

        var vimeoStatus = "";


        initVimeo();

        function initVimeo(){

            //check if there are any obvious problems
            if(checkForProblems()) return;

            console.log('vimeo player up and running for: ', self);

            if(opts){
                if(typeof opts === 'String'){
                    handleControls(opts, value);
                } else if(typeof opts === 'Object'){
                    handleOptions(opts);
                }
            }

            addListeners();

        }

        function checkForProblems(){

            if('postMessage' in window == false) {
                console.warn("Your browser doesn't support postMessage. It's needed for this plugin.");
                return true;
            }

            if(self.prop('tagName').toLowerCase() !== 'iframe'){
                console.warn("This element isn't an Iframe. Problem? I think so.");
                return true;
            }

            if(self.attr('src').search('vimeo.com') < 0){
                console.warn("It seems like the source of this iframe isn't pointing to vimeo.");
                return true;
            }

            if(self.attr('src').search('api=1') < 0){
                console.warn("It seems like the vimeo api isn't enabled with this video. Check to make sure there is `api=1` somewhere in your query strings");
                return true;
            }

            return false;
        }

        function addListeners(){

            if(win.attachEvent){
                win.attachEvent('onmessage', onMessageReceived, false);
            }else{
                win.addEventListener('message', onMessageReceived, false);
            }

        }

        function runVimeoCommand(cmd, value){

            var data = {method : cmd};

            if (value){
                data.value = value;
            }

            domEl.contentWindow.postMessage(JSON.stringify(data), url)
        }

        function runCallBack(cBack, e){
            if(options[cBack] && typeof options[cBack] =='function') options[cBack].call(self, e);
        }

        function onMessageReceived(e){

            var data = JSON.parse(e.data);

            if(data.event =='ready') {
                onVimeoPlayerRady();
            }

            runCallBack('on'+ data.event, e);
            vimeoStatus = data.event;
        }


        function onVimeoPlayerRady(){

            if(options.play){
                $(options.play).click(function(){
                    vimeoStatus == 'play' ? runVimeoCommand('pause') : runVimeoCommand('play');
                });
            }

            for(var i = 0, len = vimeoEvents.length; i< len; i++){
                runVimeoCommand('addEventListener', vimeoEvents[i]);
            }

        }

        function handleControls(control, value){

            runVimeoCommand(control, value);

        }

        function handleOptions(options){
            $.extend(options, opts);
        }

        return this;
    }

})(window, jQuery);