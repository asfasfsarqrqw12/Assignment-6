var party = [
  {id:'balcony',room:'Balcony',floor:2,guests:[
    {name:'Aigerim',color:'green',time:'20:45',aitu:true,things:['cup','crumbs']},
    {name:'Aliya',color:'black',time:'21:15',aitu:false,things:['phone','cup']},
    {name:'Madina',color:'green',time:'22:10',aitu:false,things:['phone','bag','crumbs']},
    {name:'Ivan',color:'black',time:'20:10',aitu:true,things:['cup']}]},
  {id:'hall',room:'Hall',floor:2,guests:[
    {name:'Arman',color:'yellow',time:'20:35',aitu:false,things:['bag','glasses']},
    {name:'Sophia',color:'purple',time:'21:20',aitu:true,things:['phone']},
    {name:'Dias',color:'green',time:'19:45',aitu:true,things:[]},
    {name:'Bekzat',color:'purple',time:'20:55',aitu:false,things:['bag','cup','crumbs']},
    {name:'Aruzhan',color:'blue',time:'21:50',aitu:true,things:['phone']},
    {name:'Saule',color:'green',time:'21:25',aitu:false,things:['glasses']}]},
  {id:'kitchen',room:'Kitchen',floor:1,guests:[
    {name:'Nurlan',color:'red',time:'19:40',aitu:true,things:['phone','cup']},
    {name:'Emma',color:'black',time:'20:15',aitu:false,things:['bag']},
    {name:'Timur',color:'green',time:'21:05',aitu:true,things:['phone','bag','crumbs']},
    {name:'Sergey',color:'yellow',time:'20:50',aitu:false,things:[]},
    {name:'Yerlan',color:'red',time:'21:40',aitu:true,things:['glasses','phone']},
    {name:'Kamila',color:'green',time:'20:05',aitu:false,things:['cup']}]},
  {id:'living-room',room:'Living room',floor:1,guests:[
    {name:'Daniel',color:'blue',time:'19:55',aitu:true,things:['glasses']},
    {name:'Zarina',color:'green',time:'21:10',aitu:false,things:['bag','phone','crumbs']},
    {name:'Natasha',color:'yellow',time:'20:30',aitu:true,things:[]},
    {name:'Askar',color:'black',time:'21:00',aitu:true,things:['phone']},
    {name:'Inkar',color:'purple',time:'20:20',aitu:false,things:['bag']}]}
];

var ICONS={phone:'📱',glasses:'👓',bag:'👜',cup:'☕',crumbs:'🍰'};
var WORDS={phone:'a phone',glasses:'glasses',bag:'a bag',cup:'a cup',crumbs:'cake crumbs'};
var AVATAR='https://api.dicebear.com/9.x/open-peeps/svg?seed=';
var miras={name:'Miras',color:'blue',time:'21:20',aitu:true,things:['phone']};

function makeCard(g){
  var $g=$('<div class="guest">').addClass('color-'+g.color+(g.aitu?' aitu':' not-aitu'))
    .attr({'data-name':g.name,'data-color':g.color,'data-time':g.time,'data-aitu':g.aitu,'data-things':g.things.join(' ')});
  $.each(g.things,function(_,t){$g.addClass('has-'+t);});
  $('<img>').attr({src:AVATAR+encodeURIComponent(g.name),alt:g.name}).appendTo($g);
  if(g.aitu)$('<span class="badge">').text('🎓').appendTo($g);
  return $g.append(
    $('<div class="name">').text(g.name),
    $('<div class="time">').text('⏱ '+g.time),
    $('<div class="icons">').text(g.things.map(function(t){return ICONS[t];}).join(' '))
  );
}

function build(){
  removeCard();
  $('#house').empty();

  $.each([2,1],function(_,floor){
    var $f=$('<div class="floor">').attr('id','floor'+floor).appendTo('#house');
    $('<div class="floor-label">').text('Floor '+floor).appendTo($f);

    $.each(party,function(_,r){
      if(r.floor!==floor)return;

      var $r=$('<div class="room">').attr({id:r.id,'data-name':r.room}).appendTo($f);
      $r.append(
        $('<h3>').text(r.room),
        $('<button class="sort" type="button">').text('Sort by time')
      );

      var $list=$('<div class="guests">').appendTo($r);
      $.each(r.guests,function(_,g){makeCard(g).appendTo($list);});
    });
  });

  if(typeof resetSortState==='function')resetSortState();
}

var cases=[
  {t:'Who is in the hall?',f:function(){return $('#hall .guest');}},
  {t:'Who is dressed in yellow or purple?',f:function(){return $('.guest.color-yellow, .guest.color-purple');}},
  {t:'Which AITU students are upstairs?',f:function(){return $('#floor2 .guest.aitu');}},
  {t:'Who has glasses or a bag?',f:function(){return $('.guest.has-glasses, .guest.has-bag');}},
  {t:'Who came with nothing at all?',f:function(){return $('.guest[data-things=""]');}},
  {t:'Who has a phone but no bag?',f:function(){return $('.guest.has-phone:not(.has-bag)');}},
  {t:'Who arrived between 20:30 and 21:00?',f:function(){
    return $('.guest').filter(function(){
      var t=$(this).attr('data-time');
      return t>='20:30'&&t<='21:00';
    });
  }},
  {t:'Who arrived after 21:00 and is not AITU?',f:function(){
    return $('.guest.not-aitu').filter(function(){return $(this).attr('data-time')>'21:00';});
  }},
  {t:'Who stands next to Askar?',f:function(){
    var $a=$('.guest[data-name="Askar"]');
    return $a.prev('.guest').add($a.next('.guest'));
  }},
  {t:'Who stands last in each room?',f:function(){return $('.guests').children('.guest:last-child');}},
  {t:'Who stands third in each room?',f:function(){return $('.guests').children('.guest:nth-child(3)');}},
  {t:'Who stands after Timur?',f:function(){return $('.guest[data-name="Timur"]').nextAll('.guest');}},
  {t:'Who stands before someone in black?',f:function(){return $('.guest.color-black').prev('.guest');}},
  {t:'In which room is Aruzhan?',f:function(){return $('.guest[data-name="Aruzhan"]').closest('.room');}},
  {t:'Which rooms have fewer than 6 guests?',f:function(){
    return $('.room').filter(function(){return $(this).find('.guest').length<6;});
  }},
  {t:'Which rooms have a cup but nobody with glasses?',f:function(){
    return $('.room:has(.has-cup):not(:has(.has-glasses))');
  }},
  {t:'Who came first in each room?',f:function(){
    return $('.room').map(function(){
      return $(this).find('.guest').get().sort(function(a,b){
        return $(a).attr('data-time').localeCompare($(b).attr('data-time'));
      })[0];
    });
  }}
];

function showResult(i,$found){
  var $guests=$found.filter('.guest');

  if($found.filter('.room').length){
    $found.each(function(){$guests=$guests.add($(this).find('.guest'));});
  }

  var names=$found.map(function(){return $(this).attr('data-name');}).get();

  $('#result').text('Case '+(i+1)+': found '+$found.length+
    (names.length?' — '+names.join(', '):''));

  $found.addClass('found');
  $guests.stop(true,false).animate({top:-18},150).animate({top:0},150);
  $('.guest').not($guests).stop(true,false).fadeTo(300,0.2);
}

function runCase(i){
  if(typeof moving!=='undefined'&&moving)return;

  build();
  var $found;

  if(i<17){
    $found=cases[i].f();
    showResult(i,$found);
    return;
  }

  if(i===17){
    var room=party.filter(function(r){return r.id==='living-room';})[0];

    if(!room.guests.some(function(g){return g.name==='Miras';})){
      var at=room.guests.findIndex(function(g){return g.name==='Inkar';});
      room.guests.splice(at,0,miras);
    }

    var $m=$('.guest[data-name="Miras"]');
    if(!$m.length)$m=makeCard(miras);

    $m.hide().insertAfter('.guest[data-name="Askar"]');

    $('#result').text('Case 18: Miras joined between Askar and Inkar.');
    $('.guest').not($m).stop(true,false).fadeTo(300,0.2);
    $m.fadeIn(500);
    return;
  }

  if(i===18){
    var $n=$('.guest[data-name="Natasha"]');

    $('#result').text('Case 19: Natasha is leaving the party.');
    $('.guest').not($n).stop(true,false).fadeTo(300,0.2);

    party.forEach(function(r){
      r.guests=r.guests.filter(function(g){return g.name!=='Natasha';});
    });

    $n.fadeOut(500,function(){$(this).remove();});
    return;
  }

  $found=$('#floor1 .guest.has-crumbs:not(.has-cup)')
    .filter(function(){
      var t=$(this).attr('data-time');
      return t>'21:00'&&t<'21:30';
    })
    .filter(function(){
      return $(this).prev('.guest.aitu').length||$(this).next('.guest.aitu').length;
    });

  showResult(19,$found);
}

$(function(){
  $.each(cases,function(i,c){
    $('<button type="button">').text((i+1)+'. '+c.t)
      .appendTo('#cases').on('click',function(){runCase(i);});
  });

  $.each(['Miras joins','Natasha leaves','Who took the cake?'],function(i,t){
    $('<button type="button">').text((i+18)+'. '+t)
      .appendTo('#cases').on('click',function(){runCase(i+17);});
  });

  $('<button type="button">').text('Clear').appendTo('#cases').on('click',function(){
    $('.guest,.room').removeClass('found');
    $('.guest').stop(true,false).css('top',0).fadeTo(300,1);
    $('#result').text('All guests are visible again.');
  });

  build();
});