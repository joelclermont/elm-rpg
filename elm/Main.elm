module Main exposing (..)

import Html exposing (Html)
import Html.App as App
import Keyboard.Extra
import Random
import AnimationFrame
import Time exposing (Time)
import Svg exposing (..)
import Svg.Attributes exposing (..)


-- MODEL


type alias Model =
    { player : Player
    , map : Map
    , keyboardModel : Keyboard.Extra.Model
    }


type alias Player =
    { x : Float
    , y : Float
    , speed : Float
    }


type alias Map =
    { width : Float
    , height : Float
    , tiles : List (List Tile)
    }


type Tile
    = WaterTile
    | GrassTile


type Msg
    = KeyboardExtraMsg Keyboard.Extra.Msg
    | Tick Time
    | LoadMap (List (List Tile))


tileWidth : Float
tileWidth =
    32


tileHeight : Float
tileHeight =
    32


playerWidth : Float
playerWidth =
    32


playerHeight : Float
playerHeight =
    48


init : ( Model, Cmd Msg )
init =
    let
        ( keyboardModel, keyboardCmd ) =
            Keyboard.Extra.init

        mapWidth =
            100

        mapHeight =
            100

        initialPlayerX =
            0.0

        initialPlayerY =
            0.0

        initialPlayerSpeed =
            3.0
    in
        ( { player = Player initialPlayerX initialPlayerY initialPlayerSpeed
          , map = Map mapWidth mapHeight []
          , keyboardModel = keyboardModel
          }
        , Cmd.batch
            [ Cmd.map KeyboardExtraMsg keyboardCmd
            , Random.generate LoadMap <| mapGenerator mapWidth mapHeight
            ]
        )


mapGenerator : Int -> Int -> Random.Generator (List (List Tile))
mapGenerator width height =
    Random.list height <| Random.list width tileGenerator


tileGenerator : Random.Generator Tile
tileGenerator =
    Random.map mapIntToTile (Random.int 0 1)


mapIntToTile : Int -> Tile
mapIntToTile n =
    case n of
        0 ->
            WaterTile

        _ ->
            GrassTile



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        KeyboardExtraMsg keyMsg ->
            let
                ( keyboardModel, keyboardCmd ) =
                    Keyboard.Extra.update keyMsg model.keyboardModel
            in
                ( { model | keyboardModel = keyboardModel }
                , Cmd.map KeyboardExtraMsg keyboardCmd
                )

        Tick _ ->
            let
                { x, y } =
                    Keyboard.Extra.arrows model.keyboardModel

                oldPlayer =
                    model.player

                newPlayer =
                    { oldPlayer | x = oldPlayer.x + ((toFloat x) * oldPlayer.speed), y = oldPlayer.y + ((toFloat y) * oldPlayer.speed) }
            in
                { model | player = newPlayer } ! []

        LoadMap tileList ->
            let
                oldMap =
                    model.map

                newMap =
                    { oldMap | tiles = tileList }
            in
                { model | map = newMap } ! []



-- VIEW


view : Model -> Html Msg
view model =
    svg
        [ version "1.1", x "0", y "0", width "500", height "400" ]
        [ drawMap model.map ( model.player.x, model.player.y )
        , drawPlayer model.player
        ]


drawPlayer : Player -> Svg msg
drawPlayer player =
    rect [ fill "#00FFFF", x "0", y "0", width (toString playerWidth), height (toString playerHeight) ] []


drawMap : Map -> ( Float, Float ) -> Svg msg
drawMap map ( x, y ) =
    let
        moveMapX =
            (negate x)

        moveMapY =
            y - (map.height * tileHeight) + playerHeight
    in
        g [ transform ("translate(" ++ (toString moveMapX) ++ "," ++ (toString moveMapY) ++ ")") ] (List.indexedMap drawMapRow map.tiles)


drawMapRow : Int -> List Tile -> Svg msg
drawMapRow y row =
    g [] (List.indexedMap (drawMapTile y) row)


drawMapTile : Int -> Int -> Tile -> Svg msg
drawMapTile yPos xPos tile =
    case tile of
        WaterTile ->
            rect
                [ fill "#0000FF"
                , x (toString (toFloat xPos * tileWidth))
                , y (toString (toFloat yPos * tileHeight))
                , width (toString tileWidth)
                , height (toString tileHeight)
                ]
                []

        GrassTile ->
            rect
                [ fill "#00FF00"
                , x <| toString (toFloat xPos * tileWidth)
                , y <| toString (toFloat yPos * tileHeight)
                , width (toString tileWidth)
                , height (toString tileHeight)
                ]
                []



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map KeyboardExtraMsg Keyboard.Extra.subscriptions
        , AnimationFrame.diffs Tick
        ]



-- MAIN


main : Program Never
main =
    App.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
