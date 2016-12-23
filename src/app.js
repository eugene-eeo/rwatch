var $ = nut;
var pusher = new Pusher('50ed18dd967b455393ed');
var message = $.el('#message');
var input = $.el('#subreddit');
var subs = $.el('#subreddits');
var subscriptions = store.get('subs') || [];

function makeListing(listing) {
    return kr.div({class: 'post'}, [
        kr.a({target: '_blank', href: 'https://www.reddit.com' + listing.permalink}, kr.h3(listing.title)),
        kr.span({class: 'time', 'data-time': listing.created_utc}, vagueTime.get({
            to: listing.created_utc,
            units: 's',
        })),
    ]);
}

function makeSubreddit(sub) {
    var unsubscribe = kr.button({class: 'unsubscribe'}, 'X');
    var posts = kr.div({class: 'posts'});
    var div = kr.div({class: 'subreddit'}, [
        kr.div({class: 'header'}, [unsubscribe, kr.h2(sub)]),
        posts,
    ]);
    var channel = pusher.subscribe(sub);
    evee.on(unsubscribe, 'click', function(ev) {
        pusher.unsubscribe(sub);
        div.parentNode.removeChild(div);
        subscriptions.splice(subscriptions.indexOf(sub), 1);
        store.set('subs', subscriptions);
    });
    channel.bind('new-listing', function(listing) {
        var node = makeListing(listing);
        posts.insertBefore(node, posts.firstChild);
    });
    return div;
}

function subscribe(sub) {
  subs.appendChild(makeSubreddit(sub));
}

function swapIfNeq(obj, prop, val) {
    if (obj[prop] !== val) {
        obj[prop] = val;
    }
}

setInterval(function() {
    $('.post').forEach(function(el)  {
        var span = $.el('.time', el);
        swapIfNeq(span, 'textContent', vagueTime.get({
            to: +span.getAttribute('data-time'),
            units: 's',
        }));
    });
}, 10*1000);

var message_map = {
    'initialized':  { color: 'yellow', text: 'Setting up the connection...' },
    'connecting':   { color: 'yellow', text: 'Trying to connect, hold on...' },
    'connected':    { color: 'green', text: "We're good to go!" },
    'unavailable':  { color: 'red', text: 'You may need to check your connection.' },
    'failed':       { color: 'red', text: 'Pusher is not supported on this browser.' },
    'disconnected': { color: 'red', text: "Yikes. Try reloading the page." },
};

pusher.connection.bind('state_change', function(states) {
    message.innerHTML = '';
    var info = message_map[states.current];
    message.classList.add(info.color);
    message.appendChild(kr.p(info.text));
    setTimeout(function() {
        message.innerHTML = '';
        message.classList.remove(info.color);
    }, 2500);
});

evee.delegate(document.body, 'click', '.post', function(el, post) {
    post.parentNode.removeChild(post);
});

evee.on(input, 'keydown', function(ev) {
    if (ev.which == 10 || ev.which == 13) { // Enter/Return
        var sub = input.value.toLowerCase();
        if (subscriptions.indexOf(sub) === -1) {
            subscriptions.push(sub);
            store.set('subs', subscriptions);
            subscribe(sub);
        }
    }
});

subscriptions.forEach(subscribe);
