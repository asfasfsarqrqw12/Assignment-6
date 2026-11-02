var openedCard=null,openedGuest=null,moving=false;
var sortedRooms={},originalOrders={};

function resetSortState(){
  party.forEach(function(r){
    originalOrders[r.id]=r.guests.map(function(g){return g.name;});
    sortedRooms[r.id]=false;
  });
}

function removeCard(){
  if(openedCard){
    openedCard.stop(true,false).remove();
    openedCard=null;
    openedGuest=null;
  }
}

function avatarPosition($g){
  var $img=$g.find('img'),o=$img.offset();
  return {left:o.left,top:o.top,width:$img.outerWidth(),height:$img.outerHeight()};
}

function closeCard(done){
  if(!openedCard){if(done)done();return;}

  var $c=openedCard,$g=openedGuest,p=avatarPosition($g);
  openedCard=null;
  openedGuest=null;

  $c.stop(true,false).animate({
    left:p.left,top:p.top,width:p.width,height:p.height
  },200,function(){
    $c.remove();
    if(done)done();
  });
}

function openCard($g){
  if(moving||$g.hasClass('moving'))return;

  if(openedCard){
    if(openedGuest&&openedGuest[0]===$g[0]){
      closeCard();
      return;
    }
    closeCard(function(){openCard($g);});
    return;
  }

  var things=String($g.attr('data-things')).split(' ')
    .filter(Boolean).map(function(t){return WORDS[t]||t;});

  var $room=$g.closest('.room'),p=avatarPosition($g),width=250;

  var $c=$('<div id="card">').append(
    $('<h4>').text($g.attr('data-name')),
    $('<p>').text('Clothing: '+$g.attr('data-color')),
    $('<p>').text('Came at '+$g.attr('data-time')),
    $('<p>').text($g.hasClass('aitu')?'AITU student':'Not an AITU student'),
    $('<p>').text(things.length?'Has '+things.join(' and '):'Has nothing'),
    $('<p>').text('Room: '+$room.attr('data-name'))
  );

  $('.room').not($room).each(function(){
    $('<button type="button" class="move">')
      .attr('data-to',this.id)
      .text('Move to the '+$(this).attr('data-name').toLowerCase())
      .appendTo($c);
  });

  $c.css({
    visibility:'hidden',left:p.left,top:p.top,width:width,height:'auto'
  }).appendTo('body');

  var h=$c.outerHeight();
  var left=Math.max(8,Math.min(p.left,$(window).width()-width-8));

  openedCard=$c;
  openedGuest=$g;

  $c.css({
    visibility:'visible',width:p.width,height:p.height
  }).animate({
    left:left,top:p.top,width:width,height:h
  },250);
}

function moveGuest($g,toId){
  if(moving||!$g||!$g.length)return;

  var fromId=$g.closest('.room').attr('id');
  var name=$g.attr('data-name');

  if(fromId===toId)return;

  var from=party.filter(function(r){return r.id===fromId;})[0];
  var to=party.filter(function(r){return r.id===toId;})[0];

  if(!from||!to)return;

  var guest=from.guests.filter(function(g){return g.name===name;})[0];
  if(!guest)return;

  from.guests=from.guests.filter(function(g){return g.name!==name;});
  to.guests.push(guest);

  originalOrders[fromId]=from.guests.map(function(g){return g.name;});
  originalOrders[toId]=to.guests.map(function(g){return g.name;});
  sortedRooms[fromId]=sortedRooms[toId]=false;

  moving=true;

  var w=$g.outerWidth(true),start=$g.offset();
  var $old=$('<div class="ph">').insertAfter($g).width(w);
  var $new=$('<div class="ph">').appendTo($('#'+toId+' .guests')).width(0);
  var end=$new.offset();

  var $flight=$g.clone().css({
    position:'absolute',left:start.left,top:start.top,
    width:$g.outerWidth(),margin:0,zIndex:1000,pointerEvents:'none'
  }).appendTo('body');

  $g.detach();

  $old.stop(true,false).animate({width:0},600,function(){$(this).remove();});
  $new.stop(true,false).animate({width:w},600);

  $flight.stop(true,false).animate({
    left:end.left,top:end.top
  },600,function(){
    $flight.remove();
    $g.appendTo($('#'+toId+' .guests'));
    $new.remove();
    moving=false;
  });
}

function sortRoom($room){
  if(moving)return;

  var id=$room.attr('id');
  var $list=$room.find('.guests');
  var $cards=$list.children('.guest');

  $cards.stop(true,false);

  var old={};
  $cards.each(function(){
    old[this.getAttribute('data-name')]=$(this).offset();
  });

  $cards.css({left:0,top:0});

  if(sortedRooms[id]){
    $.each(originalOrders[id],function(_,name){
      $list.append($cards.filter('[data-name="'+name+'"]'));
    });
    sortedRooms[id]=false;
  }else{
    if(!originalOrders[id]){
      originalOrders[id]=$cards.map(function(){
        return $(this).attr('data-name');
      }).get();
    }

    $cards.get().sort(function(a,b){
      return $(a).attr('data-time').localeCompare($(b).attr('data-time'));
    }).forEach(function(el){$list.append(el);});

    sortedRooms[id]=true;
  }

  $cards.each(function(){
    var $g=$(this),now=$g.offset();
    var was=old[$g.attr('data-name')];

    $g.css({
      left:was.left-now.left,
      top:was.top-now.top
    }).stop(true,false).animate({left:0,top:0},450);
  });
}

$(function(){
  resetSortState();

  $(document).on('click','.guest',function(e){
    e.stopPropagation();
    openCard($(this));
  });

  $(document).on('click',function(e){
    if(!$(e.target).closest('#card').length)closeCard();
  });

  $(document).on('keydown',function(e){
    if(e.key==='Escape')closeCard();
  });

  $(document).on('click','#card .move',function(e){
    e.stopPropagation();
    var $g=openedGuest,to=$(this).attr('data-to');
    removeCard();
    moveGuest($g,to);
  });

  $(document).on('click','.sort',function(e){
    e.stopPropagation();
    sortRoom($(this).closest('.room'));
  });
});