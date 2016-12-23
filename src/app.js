var $ = nut;
var pusher = new Pusher('50ed18dd967b455393ed');
var banner = $.el('#message');
var input = $.el('#input');
var feed = $.el('#feed');

function PersistentList(key) {
    var value = store.get(key) || [];
    return {
        get: function() { return value; },
        mut: function(f) {
            var a = value.concat([]);
            value = f(a) || a;
            store.set(key, value);
        },
    };
}

var subs = PersistentList('subs');

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
    var unsubscribe = kr.button({class: 'unsubscribe'}, '×');
    var posts = kr.div({class: 'posts'});
    var channel = pusher.subscribe(sub);
    evee.on(unsubscribe, 'click', function(ev) {
        div.parentNode.removeChild(div);
        pusher.unsubscribe(sub);
        subs.mut(function(v) {
            v.splice(v.indexOf(sub), 1);
        });
    });
    channel.bind('new-listing', function(listing) {
        posts.insertBefore(makeListing(listing), posts.firstChild);
    });
    return kr.div({class: 'subreddit'}, [
        kr.div({class: 'header'}, [
            unsubscribe,
            kr.h2(sub),
        ]),
        posts,
    ]);;
}

function subscribe(sub) {
  feed.appendChild(makeSubreddit(sub));
}

function swapIfNeq(obj, prop, val) {
    if (obj[prop] !== val) {
        obj[prop] = val;
    }
}

setInterval(function() {
    $('.time').forEach(function(span) {
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
    var info = message_map[states.current];
    banner.innerHTML = '';
    banner.classList.add(info.color);
    banner.appendChild(kr.p(info.text));
    banner.classList.toggle('hidden');
    setTimeout(function() {
        banner.innerHTML = '';
        banner.classList.remove(info.color);
        banner.classList.toggle('hidden');
    }, 2500);
});

evee.delegate(feed, 'click', '.post', function(el, post) {
    post.parentNode.removeChild(post);
});

evee.on(input, 'keydown', function(ev) {
    // Not Enter/Return
    if (!(ev.which === 10 || ev.which === 13)) {
        return;
    }
    var sub = input.value.toLowerCase();
    if (subs.get().indexOf(sub) === -1) {
        subs.mut(function(v) { v.push(sub); });
        subscribe(sub);
    }
});

subs.get().forEach(subscribe);
dragula([feed], {direction: 'horizontal'});
